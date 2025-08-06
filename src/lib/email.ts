import nodemailer from 'nodemailer';

// メール送信設定
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmailを使用
  auth: {
    user: process.env.EMAIL_USER, // 送信元メールアドレス
    pass: process.env.EMAIL_PASS  // アプリパスワード
  }
});

// メール送信関数
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// メール認証用のメール送信
export async function sendVerificationEmail(email: string, username: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">メールアドレスの確認</h2>
      <p>こんにちは、${username}さん</p>
      <p>掲示板アプリにご登録いただき、ありがとうございます。</p>
      <p>以下のリンクをクリックして、メールアドレスの確認を完了してください：</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        メールアドレスを確認する
      </a>
      <p>このリンクは24時間後に無効になります。</p>
      <p>このメールに心当たりがない場合は、無視してください。</p>
    </div>
  `;

  return sendEmail(email, 'メールアドレスの確認 - 掲示板アプリ', html);
}

// パスワードリセット用のメール送信
export async function sendPasswordResetEmail(email: string, username: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">パスワードリセット</h2>
      <p>こんにちは、${username}さん</p>
      <p>パスワードリセットのリクエストを受け付けました。</p>
      <p>以下のリンクをクリックして、新しいパスワードを設定してください：</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        パスワードをリセットする
      </a>
      <p>このリンクは1時間後に無効になります。</p>
      <p>このリクエストを送信していない場合は、このメールを無視してください。</p>
    </div>
  `;

  return sendEmail(email, 'パスワードリセット - 掲示板アプリ', html);
}

// 管理者通知用のメール送信
export async function sendAdminNotification(subject: string, content: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL environment variable is not set');
    return { success: false, error: 'Admin email not configured' };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">管理者通知</h2>
      <h3>${subject}</h3>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
        ${content}
      </div>
      <p>このメールは掲示板アプリの管理者通知システムから送信されています。</p>
    </div>
  `;

  return sendEmail(adminEmail, `管理者通知: ${subject}`, html);
} 