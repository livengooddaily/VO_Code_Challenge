from django.core.management.base import BaseCommand

from test_app_1.core import create_test_objects


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        create_test_objects.TestObjectCreator().create_test_objects()




