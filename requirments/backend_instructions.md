#Project Overview
Connect the databse to this project.
Then use this guide to build the backend for the project, Postora.

#Tech Stack
- We will use Next.js, Supabase, Clerk.

#Tables and Buckets Already Created
- Tables:

    - users
    CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT UNIQUE,
    subscription_id TEXT,
    subscription_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    metadata JSONB,
    password TEXT NOT NULL
);

    - generations
    CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input_content TEXT NOT NULL,
    output_format VARCHAR(20) NOT NULL,
    bullet_points JSONB,
    canva_design_id TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);



    - subscriptions
    CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_sub_id TEXT NOT NULL,
    plan VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL
);
    - templates
    CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



    - webhook_event
    CREATE TABLE webhook_events (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



Security Features already implemented:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own data"
ON users
FOR SELECT
USING (auth.uid() = id);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User generations access"
ON generations
FOR ALL
USING (auth.uid() = user_id);



- Buckets:
    -postora-generations

# Requirements
- Connect the database to this project.
- Implement the security features.
- Implement the api routes.
- Implement the webhooks.

1. create user to user table
##After the sign in via clerk, create a user in the user table. no duplicates.
##If the user already exists, update the last_login field.
##If the user does not exist, create a new user in the user table.

2. Upload
##After the user is created, upload the generations to the postora-generations bucket.

Also make sure the user can download their own generations from the postora-generations bucket.





#Relevant Docs
## Example of uploading files to supabase storage
import { createClient } from '@supabase/supabase-js'
// create supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// upload file to bucket
const { data, error } = await supabase.storage
  .from('postora-generations')
  .upload(`${user.id}/generation-${generation.id}.png`, file)










