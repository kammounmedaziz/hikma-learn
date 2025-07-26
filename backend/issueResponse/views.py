from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Issue, IssueStatus
from .serializers import IssueSerializer

#  Create a new issue
class IssueCreateView(generics.CreateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

# list of all the issues available
class IssueListView(generics.ListAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

# viewing a specific issue
class IssueDetailView(generics.RetrieveAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

#  Update status of an issue
class IssueStatusUpdateView(APIView):
    def patch(self, request, pk):
        try:
            issue = Issue.objects.get(pk=pk)
        except Issue.DoesNotExist:
            return Response({'error': 'Issue not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in IssueStatus.choices]
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        issue.status = new_status
        issue.save()
        return Response(IssueSerializer(issue).data, status=status.HTTP_200_OK)
