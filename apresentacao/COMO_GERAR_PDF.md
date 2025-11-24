# 📄 Como Gerar o PDF da Apresentação

Existem duas formas de gerar o PDF da apresentação:

## Método 1: Usando o Script Python (Recomendado)

1. Instale a biblioteca WeasyPrint:
```bash
pip install weasyprint
```

2. Execute o script:
```bash
cd apresentacao
python gerar_pdf.py
```

O arquivo `apresentacao.pdf` será gerado na mesma pasta.

## Método 2: Usando o Navegador (Mais Simples)

1. Abra o arquivo `apresentacao.html` no seu navegador (Chrome, Edge, Firefox, etc.)

2. Pressione `Ctrl+P` (Windows/Linux) ou `Cmd+P` (Mac)

3. Nas opções de impressão:
   - **Destino**: Escolha "Salvar como PDF"
   - **Layout**: Paisagem (Landscape)
   - **Margens**: Mínimas ou Nenhuma
   - **Escala**: 100%

4. Clique em "Salvar" e escolha o local para salvar o PDF

## Notas Importantes

- A apresentação foi configurada para formato A4 em paisagem
- Cada slide ocupa uma página completa
- O arquivo HTML pode ser visualizado diretamente no navegador para apresentação
- Para apresentação em tela, você pode usar o modo de apresentação do navegador (F11)

## Estrutura da Apresentação

A apresentação contém 11 slides:
1. Capa (Tema, Autores, Orientador)
2. Índice
3. Apresentação do Projeto
4. Problema e Objetivo
5. Funcionalidades Principais
6. Tecnologias Utilizadas
7. Arquitetura do Sistema
8. Processo de Desenvolvimento
9. Fluxo de Funcionamento
10. Desafios e Soluções
11. Resultados e Conclusão

