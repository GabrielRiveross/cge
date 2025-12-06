import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib import colors

def _clp(value: float | int) -> str:
    # Formato CLP con separador de miles (sin decimales para total visual)
    try:
        return f"${int(round(float(value))):,}".replace(",", ".")
    except Exception:
        return f"${value}"

def build_boleta_pdf(*, boleta, cliente) -> bytes:
    """
    Genera un PDF simple de boleta, devolviendo bytes.
    'boleta' y 'cliente' son instancias ORM (models.Boleta, models.Cliente).
    """
    buffer = io.BytesIO()
    width, height = A4
    c = canvas.Canvas(buffer, pagesize=A4)

    # Márgenes
    margin_x = 20 * mm
    top = height - 20 * mm

    # Encabezado
    c.setFont("Helvetica-Bold", 16)
    c.drawString(margin_x, top, "CGE - Boleta de Consumo Eléctrico")

    c.setLineWidth(0.5)
    c.setStrokeColor(colors.black)
    c.line(margin_x, top - 5 * mm, width - margin_x, top - 5 * mm)

    # Datos boleta / cliente
    c.setFont("Helvetica", 10)

    y = top - 15 * mm
    c.drawString(margin_x, y, f"Cliente: {cliente.nombre_razon}")
    y -= 6 * mm
    c.drawString(margin_x, y, f"RUT: {cliente.rut}")
    y -= 6 * mm
    c.drawString(margin_x, y, f"Email: {cliente.email_contacto or '-'}")
    y -= 6 * mm
    c.drawString(margin_x, y, f"Dirección de facturación: {cliente.direccion_facturacion or '-'}")

    # Datos boleta
    y -= 10 * mm
    c.setFont("Helvetica-Bold", 11)
    c.drawString(margin_x, y, f"Boleta: #{boleta.id_boleta}  |  Periodo: {boleta.mes:02d}-{boleta.anio}")
    c.setFont("Helvetica", 10)
    y -= 6 * mm
    c.drawString(margin_x, y, f"Estado: {boleta.estado}   |   Emitida: {boleta.created_at.strftime('%d-%m-%Y %H:%M')}")

    # Líneas divisorias
    y -= 6 * mm
    c.line(margin_x, y, width - margin_x, y)

    # Detalle cobros
    y -= 12 * mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin_x, y, "Detalle de Cargos")
    y -= 8 * mm

    # Tabla simple
    left = margin_x
    right = width - margin_x
    col1 = left + 5 * mm
    col2 = right - 50 * mm

    c.setFont("Helvetica-Bold", 10)
    c.drawString(col1, y, "Concepto")
    c.drawString(col2, y, "Monto")
    y -= 5 * mm
    c.line(left, y, right, y)

    c.setFont("Helvetica", 10)
    rows = [
        (f"Energía (kWh): {float(boleta.kwh_total):.0f}", boleta.tarifa_base),
        ("Cargos", boleta.cargos),
        ("IVA (19%)", boleta.iva),
    ]
    for label, amount in rows:
        y -= 7 * mm
        c.drawString(col1, y, label)
        c.drawRightString(right - 2 * mm, y, _clp(amount))

    # Total
    y -= 10 * mm
    c.setLineWidth(1)
    c.line(left, y, right, y)
    y -= 8 * mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(col1, y, "TOTAL A PAGAR")
    c.drawRightString(right - 2 * mm, y, _clp(boleta.total_pagar))

    # Nota final
    y -= 15 * mm
    c.setFont("Helvetica-Oblique", 9)
    c.setFillColor(colors.grey)
    c.drawString(margin_x, y, "Documento generado automáticamente. Si requiere detalle por medidor, adjúntelo en el front.")
    c.setFillColor(colors.black)

    # Pie de página
    c.setFont("Helvetica", 8)
    c.drawRightString(right, 15 * mm, f"Generado: {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}")

    c.showPage()
    c.save()

    pdf = buffer.getvalue()
    buffer.close()
    return pdf
