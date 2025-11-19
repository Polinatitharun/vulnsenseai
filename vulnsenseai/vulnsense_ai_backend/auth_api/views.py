from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from .models import *
import pandas as pd

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"] # type: ignore
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data, 
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class OverviewStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_admins = User.objects.filter(role="admin").count()
        active_admins = User.objects.filter(role="admin", is_active=True).count()
        total_superadmins = User.objects.filter(role="superadmin").count()

        return Response({
            "total_admins": total_admins,
            "active_admins": active_admins,
            "superadmins": total_superadmins,
        })

from django.contrib.auth.hashers import make_password

class AdminManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        password = request.data.get("password")
        if not password:
            return Response({"error": "Password is required"}, status=400)

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(password=make_password(password))
            SystemActivity.objects.create(action="add_user", performed_by=request.user, target_user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UploadAddExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        df = pd.read_excel(file)
        created_users = []
        for _, row in df.iterrows():
            username = row['username']
            email = row['email']
            password = row.get('password')
            
            user, created = User.objects.get_or_create(
                username=username,
                email=email,
                defaults={'role': row.get('role', 'admin'), 'password': make_password(password)}
            )
            if created:
                created_users.append(username)
                SystemActivity.objects.create(
                    action="add_user",
                    performed_by=request.user,
                    target_user=user
                )
        return Response({"created_users": created_users}, status=201)

class UploadDeleteExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        df = pd.read_excel(file)
        deleted_users = []
        for _, row in df.iterrows():
            user = User.objects.filter(email=row['email']).first()
            if user:
                deleted_users.append(user.username)
                SystemActivity.objects.create(
                    action="delete_user",
                    performed_by=request.user,
                    target_user=user
                )
                user.delete()

        return Response({"deleted_users": deleted_users}, status=200)

class UploadActivateExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        df = pd.read_excel(file)
        activated_users = []
        for _, row in df.iterrows():
            user = User.objects.filter(email=row['email']).first()
            if user and not user.is_active:
                user.is_active = True
                user.save()
                activated_users.append(user.username)
                SystemActivity.objects.create(
                    action="activate_user",
                    performed_by=request.user,
                    target_user=user
                )

        return Response({"activated_users": activated_users}, status=200)

class UploadDeactivateExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        df = pd.read_excel(file)
        deactivated_users = []
        for _, row in df.iterrows():
            user = User.objects.filter(email=row['email']).first()
            if user and user.is_active:
                user.is_active = False
                user.save()
                deactivated_users.append(user.username)
                SystemActivity.objects.create(
                    action="deactivate_user",
                    performed_by=request.user,
                    target_user=user
                )

        return Response({"deactivated_users": deactivated_users}, status=200)

class ToggleUserStatusView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = not user.is_active
        user.save()
        action = "activate_user" if user.is_active else "deactivate_user"
        SystemActivity.objects.create(action=action, performed_by=request.user, target_user=user)
        return Response({"id": user.id, "is_active": user.is_active})


class PromoteSuperAdminView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.role = "superadmin"
        user.save()
        SystemActivity.objects.create(action="promote_superadmin", performed_by=request.user, target_user=user)
        return Response({"id": user.id, "role": user.role})

class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response({"message": "User deleted"})

class SystemActivityView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        logs = SystemActivity.objects.all().order_by("-timestamp")[:20]
        serializer = SystemActivitySerializer(logs, many=True)
        return Response(serializer.data)