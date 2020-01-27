CREATE OR REPLACE FUNCTION cup_actions(cup cup) RETURNS setof cup_act as $$
  SELECT *
  FROM cup_act
  WHERE cup_act.id = cup.id
  ORDER BY cup_act.block DESC, cup_act.idx DESC
$$ LANGUAGE SQL stable;

CREATE OR REPLACE FUNCTION get_cup(id integer) RETURNS cup as $$
  SELECT *
  FROM cup
  WHERE cup.id = $1
  ORDER BY id DESC
  LIMIT 1
$$ LANGUAGE SQL stable;

DROP TYPE IF EXISTS  poll CASCADE;
DROP FUNCTION IF EXISTS active_polls();

CREATE TYPE poll AS (
	id integer,
	creator character varying,
	poll_id integer
);

CREATE OR REPLACE FUNCTION active_polls() RETURNS setof poll as $$
  SELECT id, creator, poll_id
  FROM polling.poll_created_event
  ORDER BY id DESC
  LIMIT 1
$$ LANGUAGE SQL stable;