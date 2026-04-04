export const emailTemplate =(otp)=>{
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>OTP Verification</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px;">
    <tr>
      <td align="center">
        
        <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#4CAF50; color:#ffffff; padding:20px; text-align:center; font-size:22px; font-weight:bold;">
              Saraha App 🔐
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; text-align:center;">
              
              <h2 style="margin-bottom:10px;">Verification Code</h2>
              
              <p style="color:#555; font-size:16px;">
                Use the following OTP to complete your request:
              </p>

              <!-- OTP BOX -->
              <div style="margin:30px 0;">
                <span style="
                  display:inline-block;
                  font-size:28px;
                  letter-spacing:8px;
                  font-weight:bold;
                  color:#333;
                  background:#f0f0f0;
                  padding:15px 25px;
                  border-radius:8px;
                ">
                 ${otp}
                </span>
              </div>

              <p style="color:#999; font-size:14px;">
                This code is valid for <strong>2 minutes</strong>.
              </p>

              <p style="color:#999; font-size:13px;">
                If you didn't request this, please ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9; padding:15px; text-align:center; font-size:12px; color:#aaa;">
              © 2026 Saraha App. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
}