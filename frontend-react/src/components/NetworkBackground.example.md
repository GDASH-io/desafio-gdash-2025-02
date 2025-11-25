# NetworkBackground Component

Componente React em TypeScript para criar um background animado com partículas conectadas por linhas.

## Uso Básico

```tsx
import NetworkBackground from '../components/NetworkBackground';

function MyPage() {
  return (
    <div className="min-h-screen relative">
      <NetworkBackground />
      {/* Seu conteúdo aqui */}
    </div>
  );
}
```

## Exemplo no Login (Implementado)

O componente já está integrado na página de Login (`src/pages/Auth/Login.tsx`):

```tsx
import NetworkBackground from '../../components/NetworkBackground';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <NetworkBackground />
      <Card className="relative z-10">
        {/* Conteúdo do card */}
      </Card>
    </div>
  );
}
```

## Props Personalizáveis

Você pode customizar a animação através de props:

```tsx
<NetworkBackground
  particleCount={100}        // Número de partículas (padrão: 80)
  colors={['#ffffff', '#33ccff', '#ff99cc']} // Cores das partículas
  maxDistance={80}           // Distância máxima para conexão (padrão: 60)
  particleSpeed={0.8}        // Velocidade das partículas (padrão: 0.5)
  lineOpacity={0.6}          // Opacidade das linhas (padrão: 0.5)
  particleRadius={3}         // Tamanho das partículas (padrão: 2)
/>
```

## Características

- ✅ Animação suave usando `requestAnimationFrame`
- ✅ Responsivo ao redimensionamento da janela
- ✅ Interação com o mouse (linhas conectam-se ao cursor)
- ✅ Performance otimizada com cleanup adequado
- ✅ TypeScript com tipos completos
- ✅ Componente funcional com hooks (useRef, useEffect)
- ✅ Canvas ocupando 100% da tela
- ✅ Partículas rebatendo nas bordas
- ✅ Linhas dinâmicas conectando partículas próximas

## Estrutura de Arquivos

```
src/
├── components/
│   ├── NetworkBackground.tsx    # Componente principal
│   └── NetworkBackground.css    # Estilos do canvas
```

## Notas Técnicas

- O canvas usa `position: fixed` e `z-index: 0` para ficar atrás do conteúdo
- Use `z-index: 10` ou superior no conteúdo que deve aparecer sobre o background
- O componente faz cleanup automático ao desmontar (remove event listeners e cancela animação)
- A animação pausa automaticamente quando o componente é desmontado

