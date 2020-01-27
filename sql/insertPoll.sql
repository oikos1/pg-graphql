INSERT INTO public.poll_created_event(
  creator,
  poll_id,
  start_block,
  end_block,
  multi_hash,
  url,
  tx_id,
  block_id,
  log_index
) 
VALUES(
    ${poll.creator}, 
    ${poll.pollId}, 
    ${poll.blockCreated}, 
    ${poll.endDate}, 
    ${poll.multiHash}, 
    ${poll.url},     
    ${poll.tx}, 
    ${poll.block},
    ${poll.log_index}
)
ON CONFLICT (tx_id)
DO NOTHING