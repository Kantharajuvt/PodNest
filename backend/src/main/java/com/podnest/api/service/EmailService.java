package com.podnest.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendStudioInvite(String to, String studioName, String inviteUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom("kantharajkantha4862@gmail.com");
            helper.setSubject("Invitation to join " + studioName + " on PodNest");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>" +
                    "  <div style='background-color: #ffffff; padding: 40px; border-radius: 10px; max-width: 600px; margin: auto;'>"
                    +
                    "    <h2 style='color: #8b5cf6;'>You've been invited to record!</h2>" +
                    "    <p>Hi there,</p>" +
                    "    <p>You've been invited to join the recording studio <strong>" + studioName
                    + "</strong> on PodNest.</p>" +
                    "    <p>Simply click the button below to join the session. No account is required!</p>" +
                    "    <div style='text-align: center; margin: 40px 0;'>" +
                    "      <a href='" + inviteUrl
                    + "' style='background-color: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;'>Join Studio</a>"
                    +
                    "    </div>" +
                    "    <p style='color: #666; font-size: 12px;'>If the button doesn't work, copy and paste this link: <br/>"
                    + inviteUrl + "</p>" +
                    "  </div>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendSessionInvite(String to, String sessionTitle, String startTime, String inviteUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom("kantharajkantha4862@gmail.com");
            helper.setSubject("Upcoming Recording: " + sessionTitle);

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>" +
                    "  <div style='background-color: #ffffff; padding: 40px; border-radius: 10px; max-width: 600px; margin: auto;'>"
                    +
                    "    <h2 style='color: #8b5cf6;'>You're scheduled to record!</h2>" +
                    "    <p>Hi there,</p>" +
                    "    <p>You've been invited as a guest for the session: <strong>" + sessionTitle + "</strong>.</p>"
                    +
                    "    <p>📅 <strong>Time:</strong> " + startTime + "</p>" +
                    "    <p>Simply click the button below at the scheduled time to join the recording. No account is required!</p>"
                    +
                    "    <div style='text-align: center; margin: 40px 0;'>" +
                    "      <a href='" + inviteUrl
                    + "' style='background-color: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;'>Join Session</a>"
                    +
                    "    </div>" +
                    "    <p style='color: #666; font-size: 12px;'>If the button doesn't work, copy and paste this link: <br/>"
                    +
                    inviteUrl + "</p>" +
                    "  </div>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
