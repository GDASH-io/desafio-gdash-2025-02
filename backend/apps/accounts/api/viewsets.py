from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.authtoken.models import Token
from apps.accounts.api.serializers import UserSerializer
from apps.accounts.api.serializers import LoginSerializer
from apps.accounts.api.serializers import LogoutSerializer
from apps.accounts.managers.register_manager import RegisterManager
from apps.accounts.models import Usuario
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth import authenticate, login


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    http_method_names = ['post', ]
    parser_classes = [MultiPartParser]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'username',
                openapi.IN_FORM,
                description="Username.",
                type=openapi.TYPE_STRING,
                required=True
            ),
            openapi.Parameter(
                'email',
                openapi.IN_FORM,
                description="E-mail do usuário.",
                type=openapi.TYPE_STRING,
                required=True
            ),
            openapi.Parameter(
                'password',
                openapi.IN_FORM,
                description="Senha do usuário.",
                type=openapi.TYPE_STRING,
                required=True
            ),
            openapi.Parameter(
                'password2',
                openapi.IN_FORM,
                description="Confirmação da senha.",
                type=openapi.TYPE_STRING,
                required=True
            ),
            openapi.Parameter(
                'avatar',
                openapi.IN_FORM,
                description="Avatar do usuário.",
                type=openapi.TYPE_FILE
            ),
        ],
        responses={
            201: openapi.Response("Usuário registrado com sucesso!"),
        },
        operation_summary="registra usuário",
    )
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        data["avatar"] = request.FILES.get("avatar")

        try:
            # Valida os dados usando o RegisterManager
            validated_data = RegisterManager.validate(data)

            # Cria o usuário usando o RegisterManager
            user = RegisterManager.create(validated_data)

            # Serializa e retorna a resposta
            response_serializer = UserSerializer(user)
            return Response(
                {
                    "message": "Usuário registrado com sucesso!",
                    "user": response_serializer.data,
                    "token": user.auth_token.key,
                },
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {"errors": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )


class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    http_method_names = ['post', ]

    @swagger_auto_schema(
        responses={200: UserSerializer},
        request_body=LoginSerializer,
        operation_summary="Autentica usuário",
    )
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"errors": "E-mail e senha são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = serializer.validated_data.get("email")
        password = serializer.validated_data.get("password")

        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response(
                {"errors": "Credenciais inválidas."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=user.username, password=password)

        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)

            response_serializer = UserSerializer(user)

            return Response(
                {
                    "message": "Login bem-sucedido!",
                    "user": response_serializer.data,
                    "token": token.key,
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"errors": "Credenciais inválidas."},
                status=status.HTTP_400_BAD_REQUEST
            )


class LogoutAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']

    @swagger_auto_schema(
        responses={200: UserSerializer},
        request_body=LogoutSerializer,
        operation_summary="Efetua o logout do usuário",
    )
    def post(self, request, *args, **kwargs):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Remove o token do usuário
            token = Token.objects.get(user=request.user)
            token.delete()

            return Response(
                {"message": "Logout realizado com sucesso!"},
                status=status.HTTP_200_OK
            )
        except Token.DoesNotExist:
            return Response(
                {"error": "Token inválido ou não encontrado."},
                status=status.HTTP_400_BAD_REQUEST
            )
