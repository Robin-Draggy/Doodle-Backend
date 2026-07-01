export const baseTemplate = ({ title, heading, content, buttonText, buttonUrl, footer }) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>

<body style="
    margin:0;
    padding:40px 0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:14px;
overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,.08);
">

<tr>
<td
style="
background:#111827;
padding:32px;
text-align:center;
">
<h1
style="
margin:0;
color:#ffffff;
font-size:30px;
font-weight:bold;
">
🛍 Doodle
</h1>
</td>
</tr>

<tr>
<td style="padding:40px">

<h2
style="
margin-top:0;
color:#111827;
font-size:26px;
">
${heading}
</h2>

<div
style="
font-size:16px;
line-height:1.7;
color:#4b5563;
">
${content}
</div>

<div
style="
margin-top:40px;
text-align:center;
">

<a
href="${buttonUrl}"
style="
display:inline-block;
background:#2563eb;
padding:16px 32px;
border-radius:8px;
color:#ffffff;
font-size:16px;
font-weight:bold;
text-decoration:none;
">
${buttonText}
</a>

</div>

<p
style="
margin-top:40px;
font-size:13px;
color:#9ca3af;
word-break:break-all;
">

If the button doesn't work, copy and paste this link into your browser:

<br><br>

${buttonUrl}

</p>

</td>
</tr>

<tr>

<td
style="
background:#f9fafb;
padding:24px;
text-align:center;
font-size:13px;
color:#6b7280;
">

${footer}

</td>

</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};
