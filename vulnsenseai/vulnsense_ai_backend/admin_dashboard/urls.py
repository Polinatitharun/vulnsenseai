from django.urls import path
from .views import *


from .views import DropdownModelsView, DropdownModelsManualView

urlpatterns = [
    path('targets/', TargetModelListCreateDeleteView.as_view(), name='target-list-create'),
    path('targets/<int:pk>/', TargetModelListCreateDeleteView.as_view(), name='target-detail'),
    path("models/", TargetModelListCreateDeleteView.as_view(), name="model-list-create"),
    # Add this line to your existing urlpatterns: for edit
    path('models/<int:pk>/', TargetModelListCreateDeleteView.as_view(), name='target-detail'),
    #path("sanitization/manual/", ManualPromptGetAPI.as_view(),name="manual-sanitization"),
    path("sanitization/", ManualSanitizationView.as_view(), name="manual-sanitization-post"),
    path('list-sanitizations/', SanitizationAPIView.as_view(), name='sanitization-list'),
    path('list-generated-prompts/', GeneratedPromptAPIView.as_view(), name='generated-prompt-list'),
    path('generate-prompt/', PromptGenerate.as_view(), name='generate_prompt'),
    path("dashboard/",AdminOverviewStatsView.as_view(),name="dashboard"),
    path('target/status/<int:pk>/',TargetStatusView.as_view(),name="targetstatus"),
    path('target/delete/<int:pk>/', TargetModelListCreateDeleteView.as_view(), name="targetdelete"),
    path("test/active/",ActiveReportView.as_view(),name="testreport"),
    path("test/completed/",CompletedReportView.as_view(),name="testcomplete"),
    path('test/report/',GeneratedReportView.as_view(),name="audit_report"),
    path('logout/',LogoutView.as_view(),name="logout"),
    path('activity/',SystemActivityView.as_view(),name="system_activity"),
    path('fuzztest/',FuzzTestingView.as_view(),name='fuzztesting'),
    # path('scan/Unbounded_consumption/',Unbounded_consumption.as_view(),name='scan-Unbounded-consumption'),
    path('fuzzresult/',FuzzTestResults.as_view(),name="fuzz_reports"),
    path('loadtest/',LoadTestView.as_view(),name="load_testing"),
    path('reports/',TestResultsView.as_view(),name="test_results"),
    path('securityscan/',SecurityScanView.as_view(),name='security_scan'),
    path("fuzzreport/<int:pk>",FuzzTestReportPDF.as_view(),name='Fuzz test pdf'),
    path('testids/',TestID.as_view(),name="fuzztestids"),
    # path('securityscanpdf/<int:pk>', SecurityReportPDF.as_view(),name='security scan pdf'),
    path('fuzzgraph/<int:pk>', FuzzGraph.as_view(),name='fuzzgraph'),
    path('securitypdf/<int:pk>',SecurityScanReportPDF.as_view(),name='security pdf format'),
    path('securitygraph/<int:test_id>',SecurityScanGraph.as_view(),name="overall graph view"),
    path('securityanalytics/<int:test_id>',SecurityScanAnalytics.as_view(),name="analytics view"),
    path('loadpdf/<int:pk>',LoadTestPDF.as_view(),name="Load Test Pdf"),
    path('loadtestgraph/<int:pk>',LoadTestGraph.as_view(),name="Load Graph"),
    path('dropdown/', DropdownModelsView.as_view(), name='dropdown-models'),
    path('dropdown-manual/', DropdownModelsManualView.as_view(), name='dropdown-manual'), 
    path('api/analysis/', ComprehensiveAnalysisView.as_view(), name='comprehensive-analysis'),  
]

if settings.DEBUG:
    urlpatterns+=static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)



