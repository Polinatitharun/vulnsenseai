from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

User=get_user_model()
class Target(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="targets")
    model_name = models.CharField(max_length=100)
    endpoint_url = models.URLField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    auto_sanitization = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_scan = models.DateTimeField(null=True,blank=True)
    auto_scan = models.BooleanField(default=False)
    

    def __str__(self):
        return f"{self.model_name} ({self.user.username})"

class Sanitization(models.Model):
    prompt = models.TextField(blank=True, null=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    response_prompt=models.JSONField(blank=True,null=True)
    # sql_test=models.BooleanField(default=False)
    # xss_test=models.BooleanField(default=False)
    # input_validation=models.BooleanField(default=False)cccc

    def __str__(self):
        return f"Sanitization for {self.target.name}"




class Testing(models.Model):
    TEST_CHOICES = [
        ("fuzz_testing","Fuzz Testing"),
        ("load_testing","Load Testing"),
        ("security_scan","Security Scan")
    ]
    REPORT_CHOICE=[
        ('not_started',"Not Started"),
        ("running","Running"),
        ("completed","Completed")
    ]
    target = models.ForeignKey(Target,on_delete=models.CASCADE,null=True)
    test = models.CharField(choices=TEST_CHOICES,max_length=15,null=True)
    start_time=models.DateTimeField(auto_now_add=True)
    #vulnerabilities=models.IntegerField(default=0)
    test_status=models.CharField(choices=REPORT_CHOICE,max_length=15,default="not_started")
    prompt=models.TextField(null=True)
    response=models.TextField(null=True)
    results=models.JSONField(default=dict,null=True)
    results_file=models.FileField(blank=True,null=True,upload_to="reports/")

    def __str__(self):
        return f"Testing for {self.target.model_name}"

class FuzzTestReports(models.Model):
    target=models.ForeignKey(Target,on_delete=models.CASCADE,null=True)
    total_testcases=models.IntegerField(null=True)
    testcases_passed=models.IntegerField(null=True)
    accuracy_score=models.FloatField(null=True)
    summary=models.TextField(null=True)

    def __str__(self):
        return f"Testing for {self.target.name}"

class Auditing(models.Model):
    REPORT_TYPE=[
        ('comprehensive','Comprehensive Security Audit'),
        ('vulnerability','Vulnerability Assessment'),
        ('compliance','Compliance Report'),
        ('executive','Executive Summary')
    ]
    AUDIT_STATUS=[
        ("running","Running"),
        ("ready","Ready")
    ]
    target = models.ForeignKey(Target, on_delete=models.CASCADE,null=True)
    generated_at=models.DateTimeField(auto_now=True)
    vulnerabilities=models.IntegerField(default=True)
    risk_score=models.FloatField(null=True)
    status=models.CharField(default="running",max_length=15,choices=AUDIT_STATUS)

    def __str__(self):
        return f"Report for {self.target.name}"

class SystemActivity(models.Model):
    ACTION_CHOICES = (
        ('add_target', 'Add Target'),
        ('delete_target', 'Delete Target'),
        ('activate_target', 'Activate Target'),
        ('deactivate_target', 'Deactivate Target'),
       
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target = models.ForeignKey(Target, on_delete=models.CASCADE, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class GeneratedPrompt(models.Model):
    input_prompt = models.TextField(verbose_name="Input Prompt", blank=True)
    prompt_type = models.CharField(max_length=100, blank=True)  # NEW FIELD
    generated_response = models.TextField(verbose_name="Generated Response", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Prompt: {self.input_prompt[:50]}"


class SecurityScanReport(models.Model):
    target = models.ForeignKey(Target,on_delete=models.CASCADE,null=True,related_name="vulnerabilities")
    test=models.ForeignKey(Testing,on_delete=models.CASCADE,null=True)
    vulnerability=models.CharField(null=True,max_length=50)
    prompt_json=models.JSONField(null=True,default=dict)
    response_json=models.JSONField(null=True,default=dict)
    result_json=models.JSONField(null=True,default=dict)