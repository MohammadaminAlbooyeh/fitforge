package com.fitforge.subscriptions;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fitforge.subscriptions.controller.SubscriptionController;
import com.fitforge.subscriptions.controller.WebhookController;
import com.fitforge.subscriptions.dto.WebhookPayload;
import com.fitforge.subscriptions.model.Plan;
import com.fitforge.subscriptions.model.Subscription;
import com.fitforge.subscriptions.service.EntitlementService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Controller slice tests. Uses {@link WebMvcTest} so no database is required.
 */
@WebMvcTest(controllers = {SubscriptionController.class, WebhookController.class})
@AutoConfigureMockMvc(addFilters = false)
class WebhookControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EntitlementService entitlementService;

    private Subscription pro;

    @BeforeEach
    void setUp() {
        pro = new Subscription();
        pro.setUserId(1L);
        pro.setPlan(Plan.PRO);
        pro.setStatus(Subscription.Status.ACTIVE);
    }

    @Test
    void entitlementsReturnsActivePro() throws Exception {
        when(entitlementService.getOrCreateEntitlement(1L)).thenReturn(pro);

        mockMvc.perform(get("/entitlements/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan").value("PRO"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void revenuecatWebhookIsAcknowledged() throws Exception {
        when(entitlementService.applyWebhook(any(WebhookPayload.class))).thenReturn(pro);

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

    @Test
    void purchaseUpgradesToPro() throws Exception {
        when(entitlementService.purchase(1L, "fitforge_pro")).thenReturn(pro);

        mockMvc.perform(post("/entitlements/1/purchase")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":\"fitforge_pro\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan").value("PRO"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void cancelMarksSubscriptionCancelled() throws Exception {
        Subscription cancelled = new Subscription();
        cancelled.setUserId(1L);
        cancelled.setPlan(Plan.PRO);
        cancelled.setStatus(Subscription.Status.CANCELLED);
        when(entitlementService.cancel(1L)).thenReturn(cancelled);

        mockMvc.perform(post("/entitlements/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}