package com.podnest.api.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    public SignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/studio/{studioId}/signal")
    public void handleSignal(@DestinationVariable String studioId, @Payload Map<String, Object> signal) {
        // Broadcast the signal to everyone in the studio
        // In a real app, we might route this to specific users, but for MVP
        // broadcasting is simpler
        messagingTemplate.convertAndSend("/topic/studio/" + studioId, signal);
    }
}
