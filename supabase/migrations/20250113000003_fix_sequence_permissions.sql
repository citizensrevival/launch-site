-- Fix sequence permissions for analytics tables
-- Grant usage and select permissions on sequences to the service role

-- Grant permissions on pageviews sequence
grant usage, select on sequence analytics.pageviews_id_seq to service_role;

-- Grant permissions on events sequence  
grant usage, select on sequence analytics.events_id_seq to service_role;
