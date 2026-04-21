# PDF Pipeline — Past Use

## market-tracker
- **Context:** Streamlit-based analysis tool generates a 5-10 page PDF with CAPM charts, DCF table, supply-chain diagram. Python uses reportlab server-side; the browser equivalent is this mechanic.

## studioelitez (PDF rebrander)
- **Context:** Takes partner PDFs, erases logos, stamps Studio Elitez branding. PyMuPDF does the heavy lift server-side; client-side users run the pipeline in-browser for quick previews.

## studioelitez_quotation_preparer
- **Context:** Uploaded PDF → Gemini JSON extraction → Excel export (ExcelJS, not PDF). The PDF PATH of this pipeline could use this mechanic to preview the Excel output as a PDF.
