"""
Script para converter a apresentação HTML em PDF
Requisitos: pip install weasyprint
"""

try:
    from weasyprint import HTML
    import os

    # Caminho do arquivo HTML
    html_file = os.path.join(os.path.dirname(__file__), 'apresentacao.html')
    pdf_file = os.path.join(os.path.dirname(__file__), 'apresentacao.pdf')

    print("🔄 Convertendo HTML para PDF...")
    
    # Converter HTML para PDF
    HTML(html_file).write_pdf(
        pdf_file,
        presentational_hints=True
    )
    
    print(f"✅ PDF gerado com sucesso: {pdf_file}")
    
except ImportError:
    print("❌ Erro: Biblioteca 'weasyprint' não instalada.")
    print("📦 Instale com: pip install weasyprint")
    print("\n💡 Alternativa: Abra o arquivo apresentacao.html no navegador")
    print("   e use Ctrl+P (ou Cmd+P no Mac) > Salvar como PDF")

except Exception as e:
    print(f"❌ Erro ao gerar PDF: {e}")
    print("\n💡 Alternativa: Abra o arquivo apresentacao.html no navegador")
    print("   e use Ctrl+P (ou Cmd+P no Mac) > Salvar como PDF")

