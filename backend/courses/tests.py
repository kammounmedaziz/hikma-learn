import os
import requests
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.core.files import File
from dotenv import load_dotenv
from .models import Course, Chapter, Content, ContentKind
from .serializers import ContentSerializer

class CloudflareAPITest(TestCase):
    def setUp(self):
        # Charger les variables d'environnement
        load_dotenv()

        # Obtenir le modèle User (souvent accounts.User ou auth.User)
        User = get_user_model()

        # Créer un utilisateur pour satisfaire la contrainte de clé étrangère
        self.user = User.objects.create_user(
            username='testteacher',
            email='testteacher@example.com',
            password='testpass123',
            user_type='teacher'  # Supprimez cette ligne si user_type n'existe pas dans votre modèle User
        )

        # Créer un cours avec l'utilisateur créé
        self.course = Course.objects.create(
            title="Test Course",
            description="Test Description",
            teacher=self.user
        )

        # Créer un chapitre
        self.chapter = Chapter.objects.create(
            course=self.course,
            title="Test Chapter",
            description="Test Chapter Description",
            order=1
        )

        # Utiliser une image réelle pour le test
        image_path = 'media/content_files/Math.jpg'  # Remplacez par le chemin d'une image réelle existante
        try:
            with open(image_path, 'rb') as f:
                self.image_content = SimpleUploadedFile(
                    "test_image.jpg",
                    f.read(),
                    content_type="image/jpeg"
                )
        except FileNotFoundError:
            self.fail(f"Fichier image introuvable : {image_path}. Assurez-vous qu'une image existe à ce chemin.")

        # Créer un contenu avec une image
        self.content = Content.objects.create(
            chapter=self.chapter,
            title="Test Image Content",
            content_kind=ContentKind.FILE,
            file=self.image_content,
            file_mime_type="image/jpeg",
            file_kind="IMAGE"
        )

    def test_cloudflare_api(self):
        """Teste l'appel à l'API Cloudflare pour générer un texte alternatif."""
        ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID')
        API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN')

        self.assertIsNotNone(ACCOUNT_ID, "CLOUDFLARE_ACCOUNT_ID manquant dans .env")
        self.assertIsNotNone(API_TOKEN, "CLOUDFLARE_API_TOKEN manquant dans .env")

        # Utiliser une image réelle pour le test (remplacez par un chemin valide)
        image_path = 'media/content_files/Math.jpg'  # Remplacez par le chemin d'une image existante
        try:
            with open(image_path, 'rb') as f:
                image_bytes = f.read()
            image_array = list(image_bytes)
            response = requests.post(
                f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/llava-hf/llava-1.5-7b-hf",
                headers={"Authorization": f"Bearer {API_TOKEN}"},
                json={"prompt": "Generate a concise alt text description for this image.", "image": image_array}
            )
            self.assertEqual(response.status_code, 200, f"Erreur Cloudflare: {response.status_code} - {response.text}")
            result = response.json()
            description = result.get('result', {}).get('description', '')
            self.assertTrue(description, "La description générée par Cloudflare est vide")
            print(f"Texte alternatif généré : {description}")
        except FileNotFoundError:
            self.fail(f"Fichier image introuvable : {image_path}")
        except Exception as e:
            self.fail(f"Erreur lors de l'appel à l'API Cloudflare : {str(e)}")

    def test_generate_alt_text_serializer(self):
        """Teste la génération de texte alternatif via ContentSerializer."""
        serializer = ContentSerializer(
            instance=self.content,
            data={'generate_alt_text': True},
            partial=True,
            context={'request': None}
        )
        self.assertTrue(serializer.is_valid(), f"Erreur de validation : {serializer.errors}")
        updated_content = serializer.save()
        self.assertIsNotNone(updated_content.image_alt_text, "Le texte alternatif n'a pas été généré")
        print(f"Texte alternatif généré dans le serializer : {updated_content.image_alt_text}")