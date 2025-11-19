# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("overview/", OverviewStatsView.as_view()),
    path("admins/", AdminManagementView.as_view()),
    
    path("admins/upload_add/", UploadAddExcelView.as_view()),
    path("admins/upload_delete/", UploadDeleteExcelView.as_view()),
    path("admins/upload_activate/", UploadActivateExcelView.as_view()),
    path("admins/upload_deactivate/", UploadDeactivateExcelView.as_view()),

    path("admins/<int:pk>/toggle_status/", ToggleUserStatusView.as_view()),
    path("admins/<int:pk>/promote/", PromoteSuperAdminView.as_view()),
    path("admins/<int:pk>/delete/", DeleteUserView.as_view()),
    path("activity/", SystemActivityView.as_view()),
]
