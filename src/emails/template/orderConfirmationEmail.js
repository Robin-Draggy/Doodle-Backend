import { baseTemplate } from './baseTemplate.js';

export const orderConfirmationEmailTemplate = ({ username, orderNumber, totalAmount }) => {
  return baseTemplate({
    title: 'Order Confirmed',

    heading: 'Your Order Has Been Placed 🎉',

    content: `

<p>

Hello ${username},

</p>

<p>

Thank you for shopping with Doodle.

</p>

<table
width="100%"
style="
margin-top:20px;
border-collapse:collapse;
">

<tr>

<td><strong>Order Number</strong></td>

<td>${orderNumber}</td>

</tr>

<tr>

<td><strong>Total</strong></td>

<td>৳ ${totalAmount}</td>

</tr>

</table>

<p style="margin-top:30px;">

We'll notify you once your order is shipped.

</p>

`,

    footer: `
Thank you for choosing Doodle ❤️
`,
  });
};
