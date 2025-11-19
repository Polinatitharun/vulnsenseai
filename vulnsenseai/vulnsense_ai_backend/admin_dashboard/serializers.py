from rest_framework import serializers
from .models import *

class TargetModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Target
        fields = ['status',"model_name",'endpoint_url','auto_sanitization','created_at','last_scan','auto_scan','id']
        
class SanitizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sanitization
        fields = "__all__"

class PromptGeneratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedPrompt
        fields = '__all__'


class TestingSerializer(serializers.ModelSerializer):
    target = TargetModelSerializer(read_only=True)
    class Meta:
        model = Testing
        fields = "__all__"

class FuzzTestSerializer(serializers.ModelSerializer):
    target = TargetModelSerializer(read_only=True)
    class Meta:
        model = FuzzTestReports
        fields="__all__"

class AuditingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testing
        fields = "__all__"

class SystemActivitySerializer(serializers.ModelSerializer):
    target = TargetModelSerializer(read_only=True)
    class Meta:
        model = SystemActivity
        fields = "__all__"
    

class SecurityScanSerializer(serializers.ModelSerializer):
    class Meta:
        model=SecurityScanReport
        fields="__all__"