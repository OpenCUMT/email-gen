import fs from 'node:fs';
import nodemailer from 'nodemailer';
import { invite_links, QQ_GROUP, QQ_LINK, sender } from './constants.example';

const tasks = fs.readFileSync("./tasks.txt", "utf-8")
  .split('\n')
  .filter(line => line.trim() !== '')
  .map(line => {
    const [email, name, departments] = line.split(/\s+/);
    const department = departments.split(',')[0].trim();
    return {
      email,
      name,
      department,
      invite_link: invite_links[department]
    }
  })

const tmpl = fs.readFileSync('./dist/zh-hans/Recruit/index.html', 'utf-8');

let id = 0;
async function sendEmail(email: string, name: string, tmpl_obj: Record<string, string>) {
  id += 1;

  const transporter = nodemailer.createTransport({
    host: sender.smtp.host,
    port: sender.smtp.port,
    secure: sender.smtp.secure,
    auth: {
      user: sender.auth.user,
      pass: sender.auth.pass,
    },
  });

  const html = tmpl.replaceAll('%NAME%', tmpl_obj['name'])
    .replaceAll('%QQ_LINK%', QQ_LINK)
    .replaceAll('%QQ_GROUP%', QQ_GROUP)
    .replaceAll('%DEPARTMENT%', tmpl_obj['department'])
    .replaceAll('%INVITE_LINK%', tmpl_obj['invite_link']);

  console.log(`[${id}] Sending email to ${name} <${email}>...`);

  const info = await transporter.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to: `"${name}" <${email}>`,
    subject: sender.subject,
    html: html
  });

  console.log(`\x1b[1A\x1b[K[${id}] Message sent to ${name} <${email}>: ${info.messageId}`);
}

async function main() {
  for (const task of tasks) {
    await sendEmail(task.email, task.name, {
      name: task.name,
      department: task.department,
      invite_link: task.invite_link
    }).catch(console.error);
  }
}

main()