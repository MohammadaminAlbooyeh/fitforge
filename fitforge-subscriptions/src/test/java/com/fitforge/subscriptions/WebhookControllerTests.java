package com.fitforge.subscriptions;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;

import com.fitforge.subscriptions.dto.SubscriptionResponse;
import com.fitforge.subscriptions.dto.WebhookPayload;
import com.fitforge.subscriptions.model.Plan;
import com.fitforge.subscriptions.model.Subscription;
import com.fitforge.subscriptions.service.SubscriptionService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
class WebhookControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SubscriptionService subscriptionService;

    @BeforeEach
    void setUp() {
        Subscription pro = new Subscription();
        pro.setUserId(1L);
        pro.setPlan(Plan.PRO);
        pro.setStatus(Subscription.Status.ACTIVE);
        when(subscriptionService.findByUser(1L)).thenReturn(Optional.of(pro));
    }

    @Test
    void entitlementsReturnsActivePro() throws Exception {
        mockMvc.perform(get("/entitlements/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan").value("PRO"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void revenuecatWebhookIsAcknowledged() throws Exception {
        String body = """
                {"type":"INITIAL_PURCHASE","appUserId":"42","productId":"fitforge_pro",
                "expirationAtMs":1893456000000}
                """;

        mockMvc.perform(post("/webhooks/revenuecat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    void revenuecatWebhookMissingTypeIsRejected() throws Exception {
        mockMvc.perform(post("/webhooks/revenuecat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"appUserId\":\"42\"}"))
                .andExpect(status().isBadRequest());
    }
}