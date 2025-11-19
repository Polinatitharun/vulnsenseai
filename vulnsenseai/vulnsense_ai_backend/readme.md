py manage.py makemigrations admin_dashboard auth_api
py manage.py migrate


python manage.py shell

from auth_api.models import User

superadmin = User.objects.create_user(
    username='superadmin',   # choose a username
    email='superadmin@example.com',  # optional
    password='superadmin',   # choose a strong password
    role='superadmin',        # assign superadmin role
    is_staff=True,            # allow access to admin site
    is_superuser=True         # Django superuser privileges
)

admin = User.objects.create_user(
    username='admin',   # choose a username
    email='admin@example.com',  # optional
    password='admin',   # choose a strong password
    role='admin',        # assign superadmin role
    is_staff=True,            # allow access to admin site
    is_superuser=False         # Django superuser privileges
)



exit()

