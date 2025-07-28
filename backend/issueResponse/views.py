from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Issue, IssueStatus
from .serializers import IssueSerializer


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import Response
import json

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



@csrf_exempt
def add_response(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            issue = Issue.objects.get(id=data['issue_id'])

            response = Response.objects.create(
                issue=issue,
                identifiantRes=data['identifiantRes'],
                identifiantRec=data['identifiantRec'],
                identifiantUser=data['identifiantUser'],
                content=data['content'],
                dateCreated=timezone.now()
            )
            return JsonResponse({'message': 'Response added', 'id': response.id}, status=201)
        except Issue.DoesNotExist:
            return JsonResponse({'error': 'Issue not found'}, status=404)
        except KeyError as e:
            return JsonResponse({'error': f'Missing field: {str(e)}'}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)

    if request.method == 'GET':
        responses = Response.objects.all().values()
        return JsonResponse(list(responses), safe=False)
    return JsonResponse({'error': 'Invalid method'}, status=405)


def view_responses(request):
    if request.method == 'GET':
        issue_id = request.GET.get('issue_id')
        if issue_id:
            responses = Response.objects.filter(issue_id=issue_id).values()
        else:
            responses = Response.objects.all().values()
        return JsonResponse(list(responses), safe=False)
    return JsonResponse({'error': 'Invalid method'}, status=405)
