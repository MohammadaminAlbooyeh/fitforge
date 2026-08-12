CREATE TABLE subscriptions (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL UNIQUE,
    plan             VARCHAR(16) NOT NULL DEFAULT 'FREE',
    status           VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    store_product_id VARCHAR(255),
    current_period_end TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);