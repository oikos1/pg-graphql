--
-- PostgreSQL database dump
--

-- Dumped from database version 10.10 (Ubuntu 10.10-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.10 (Ubuntu 10.10-0ubuntu0.18.04.1)

-- Started on 2020-01-11 14:02:33 AST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP TRIGGER shut ON private.cup_action;
DROP INDEX public.gov_tx_index;
DROP INDEX public.gov_block_index;
DROP INDEX public.block_time_index;
DROP INDEX private.cup_action_tx_index;
DROP INDEX private.cup_action_tx_act_arg_idx;
DROP INDEX private.cup_action_id_index;
DROP INDEX private.cup_action_deleted_index;
DROP INDEX private.cup_action_block_index;
DROP INDEX private.cup_action_act_index;
ALTER TABLE ONLY public.gov DROP CONSTRAINT gov_tx_key;
ALTER TABLE ONLY public.block DROP CONSTRAINT block_pkey;
DROP TABLE public.gov;
DROP FUNCTION public.get_cup(id integer);
DROP FUNCTION public.exec_set_deleted();
DROP FUNCTION public.cup_history(cup public.cup, tick public.tick_interval);
DROP FUNCTION public.cup_actions(cup public.cup);
DROP VIEW public.cup_act;
DROP VIEW public.cup;
DROP TABLE public.block;
DROP TABLE private.cup_action;
DROP TYPE public.tick_interval;
DROP TYPE public.history_interval;
DROP TYPE public.get_history_interval;
DROP TYPE public.cup_state;
DROP TYPE public.act;
DROP EXTENSION plpgsql;
DROP SCHEMA public;
DROP SCHEMA private;
--
-- TOC entry 6 (class 2615 OID 28983)
-- Name: private; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA private;


--
-- TOC entry 3 (class 2615 OID 28984)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 1 (class 3079 OID 28985)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2976 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- TOC entry 595 (class 1247 OID 28991)
-- Name: act; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.act AS ENUM (
    'open',
    'join',
    'exit',
    'lock',
    'free',
    'draw',
    'wipe',
    'shut',
    'bite',
    'give'
);


--
-- TOC entry 598 (class 1247 OID 29013)
-- Name: cup_state; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.cup_state AS (
	tick timestamp with time zone,
	min_pip numeric,
	max_pip numeric,
	min_tab numeric,
	max_tab numeric,
	min_ratio numeric,
	max_ratio numeric,
	act public.act,
	arg character varying,
	ink numeric,
	art numeric,
	"time" timestamp with time zone
);


--
-- TOC entry 601 (class 1247 OID 29016)
-- Name: get_history_interval; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.get_history_interval AS (
	tick timestamp with time zone,
	min_pip numeric,
	max_pip numeric,
	min_tab numeric,
	max_tab numeric,
	min_ratio numeric,
	max_ratio numeric,
	act public.act,
	arg character varying,
	ink numeric,
	art numeric,
	"time" timestamp with time zone
);


--
-- TOC entry 604 (class 1247 OID 29018)
-- Name: history_interval; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.history_interval AS ENUM (
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'year'
);


--
-- TOC entry 607 (class 1247 OID 29032)
-- Name: tick_interval; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tick_interval AS ENUM (
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'quarter'
);


SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 199 (class 1259 OID 29045)
-- Name: cup_action; Type: TABLE; Schema: private; Owner: -
--

CREATE TABLE private.cup_action (
    id integer,
    tx character varying(66) NOT NULL,
    act public.act NOT NULL,
    arg character varying(66),
    lad character varying(66) NOT NULL,
    ink numeric DEFAULT 0 NOT NULL,
    art numeric DEFAULT 0 NOT NULL,
    ire numeric DEFAULT 0 NOT NULL,
    block integer NOT NULL,
    deleted boolean DEFAULT false,
    guy character varying(66), 
    idx integer
);


--
-- TOC entry 200 (class 1259 OID 29055)
-- Name: block; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.block (
    n integer NOT NULL,
    "time" timestamp with time zone NOT NULL,
    pip numeric,
    pep numeric,
    per numeric
);

--
-- TOC entry 201 (class 1259 OID 29061)
-- Name: cup; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.cup AS
 SELECT c.act,
    c.art,
    c.block,
    c.deleted,
    c.id,
    c.ink,
    c.ire,
    c.lad,
    c.pip,
    c.per,
    ((((c.pip * c.per) * c.ink) / NULLIF(c.art, (0)::numeric)) * (100)::numeric) AS ratio,
    ((c.pip * c.per) * c.ink) AS tab,
    c."time"
   FROM ( SELECT DISTINCT ON (cup_action.id) cup_action.act,
            cup_action.art,
            cup_action.block,
            cup_action.deleted,
            cup_action.id,
            cup_action.ink,
            cup_action.ire,
            cup_action.lad,
            ( SELECT block.pip
                   FROM public.block
                  ORDER BY block.n DESC
                 LIMIT 1) AS pip,
            ( SELECT block.per
                   FROM public.block
                  ORDER BY block.n DESC
                 LIMIT 1) AS per,
            ( SELECT block."time"
                   FROM public.block
                  WHERE (block.n = cup_action.block)) AS "time"
           FROM private.cup_action
          ORDER BY cup_action.id DESC, cup_action.block DESC) c;


--
-- TOC entry 2977 (class 0 OID 0)
-- Dependencies: 201
-- Name: VIEW cup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.cup IS 'A CDP record';


--
-- TOC entry 2978 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.act; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.act IS 'The most recent act';


--
-- TOC entry 2979 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.art; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.art IS 'Outstanding debt DAI';


--
-- TOC entry 2980 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.block; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.block IS 'Block number at last update';


--
-- TOC entry 2981 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.id IS 'The Cup ID';


--
-- TOC entry 2982 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.ink; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.ink IS 'Locked collateral PETH';


--
-- TOC entry 2983 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.ire; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.ire IS 'Outstanding debt DAI after fee';


--
-- TOC entry 2984 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.lad; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.lad IS 'The Cup owner';


--
-- TOC entry 2985 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.pip; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.pip IS 'USD/ETH price';


--
-- TOC entry 2986 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.ratio; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.ratio IS 'Collateralization ratio';


--
-- TOC entry 2987 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup.tab; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup.tab IS 'USD value of locked collateral';


--
-- TOC entry 2988 (class 0 OID 0)
-- Dependencies: 201
-- Name: COLUMN cup."time"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup."time" IS 'Timestamp at last update';


--
-- TOC entry 202 (class 1259 OID 29066)
-- Name: cup_act; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.cup_act AS
 SELECT cup_action.act,
    cup_action.arg,
    cup_action.art,
    cup_action.block,
    cup_action.deleted,
    cup_action.id,
    cup_action.ink,
    cup_action.ire,
    cup_action.lad,
    block.pip,
    block.per,
    ((((block.pip * block.per) * cup_action.ink) / NULLIF(cup_action.art, (0)::numeric)) * (100)::numeric) AS ratio,
    ((block.pip * block.per) * cup_action.ink) AS tab,
    block."time",
    cup_action.tx
   FROM (private.cup_action
     LEFT JOIN public.block ON ((block.n = cup_action.block)))
  ORDER BY cup_action.block DESC;


--
-- TOC entry 2989 (class 0 OID 0)
-- Dependencies: 202
-- Name: VIEW cup_act; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.cup_act IS 'A CDP action';


--
-- TOC entry 2990 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.act; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.act IS 'The action name';


--
-- TOC entry 2991 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.arg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.arg IS 'Data associated with the act';


--
-- TOC entry 2992 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.art; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.art IS 'Outstanding debt DAI at block';


--
-- TOC entry 2993 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.block; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.block IS 'Tx block number';


--
-- TOC entry 2994 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.deleted; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.deleted IS 'True if the cup has been deleted (shut)';


--
-- TOC entry 2995 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.id IS 'The Cup ID';


--
-- TOC entry 2996 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.ink; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.ink IS 'Locked collateral PETH at block';


--
-- TOC entry 2997 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.ire; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.ire IS 'Outstanding debt DAI after fee at block';


--
-- TOC entry 2998 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.lad; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.lad IS 'The Cup owner';


--
-- TOC entry 2999 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.pip; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.pip IS 'USD/ETH price at block';


--
-- TOC entry 3000 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.per; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.per IS 'ETH/PETH price';


--
-- TOC entry 3001 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.ratio; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.ratio IS 'Collateralization ratio at block';


--
-- TOC entry 3002 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.tab; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.tab IS 'USD value of locked collateral at block';


--
-- TOC entry 3003 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act."time"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act."time" IS 'Tx timestamp';


--
-- TOC entry 3004 (class 0 OID 0)
-- Dependencies: 202
-- Name: COLUMN cup_act.tx; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cup_act.tx IS 'Transaction hash';


--
-- TOC entry 216 (class 1255 OID 29071)
-- Name: cup_actions(public.cup); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cup_actions(cup public.cup) RETURNS SETOF public.cup_act
    LANGUAGE sql STABLE
    AS $$
  SELECT *
  FROM cup_act
  WHERE cup_act.id = cup.id
  ORDER BY cup_act.block DESC
$$;


--
-- TOC entry 217 (class 1255 OID 29072)
-- Name: cup_history(public.cup, public.tick_interval); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cup_history(cup public.cup, tick public.tick_interval) RETURNS SETOF public.cup_state
    LANGUAGE sql STABLE
    AS $_$
  WITH acts AS (
    SELECT
      act,
      arg,
      ink,
      art,
      time AS _time,
      LEAD(time) OVER (ORDER BY time ASC) AS next_time
    FROM private.cup_action
    LEFT JOIN block on block.n = private.cup_action.block
    WHERE private.cup_action.id = cup.id
  ), ticks AS (
    SELECT
      date_trunc($2::char, time) AS tick,
      min(pip) AS min_pip,
      max(pip) AS max_pip,
      avg(per) AS per
    FROM block
    WHERE time <= (SELECT max(_time) FROM acts)
    AND time >= (SELECT min(_time) FROM acts)
    GROUP BY tick
    ORDER BY tick DESC
  )

  SELECT
    tick,
    min_pip,
    max_pip,
    (min_pip * per * ink) AS min_tab,
    (max_pip * per * ink) AS max_tab,
    (min_pip * per * ink) / NULLIF(art,0) * 100 AS min_ratio,
    (max_pip * per * ink) / NULLIF(art,0) * 100 AS max_ratio,
    (CASE WHEN (date_trunc($2::char, _time) = tick) THEN act ELSE NULL END) AS act,
    (CASE WHEN (date_trunc($2::char, _time) = tick) THEN arg ELSE NULL END) AS arg,
    ink,
    art,
    (CASE WHEN (date_trunc($2::char, _time) = tick) THEN _time ELSE NULL END) AS time
  FROM (
    SELECT * FROM ticks
    LEFT OUTER JOIN (SELECT * FROM acts) as actions
    ON ticks.tick = date_trunc($2::char, actions._time)
    OR (
      ticks.tick < date_trunc($2::char, actions.next_time)
      AND ticks.tick > date_trunc($2::char, actions._time)
    )
    ORDER BY tick DESC, _time DESC
  ) AS ticks_actions;
$_$;


--
-- TOC entry 218 (class 1255 OID 29073)
-- Name: exec_set_deleted(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.exec_set_deleted() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    UPDATE private.cup_action
    SET deleted = true
    WHERE private.cup_action.id = NEW.id;
    RETURN NULL;
  END;
$$;


--
-- TOC entry 219 (class 1255 OID 29074)
-- Name: get_cup(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_cup(id integer) RETURNS public.cup
    LANGUAGE sql STABLE
    AS $_$
  SELECT *
  FROM cup
  WHERE cup.id = $1
  ORDER BY id DESC
  LIMIT 1
$_$;


--
-- TOC entry 203 (class 1259 OID 29075)
-- Name: gov; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gov (
    block integer NOT NULL,
    tx character varying(66) NOT NULL,
    var character varying(10) NOT NULL,
    arg character varying(66),
    guy character varying(66),
    cap numeric DEFAULT 0 NOT NULL,
    mat numeric DEFAULT 0 NOT NULL,
    tax numeric DEFAULT 0 NOT NULL,
    fee numeric DEFAULT 0 NOT NULL,
    axe numeric DEFAULT 0 NOT NULL,
    gap numeric DEFAULT 0 NOT NULL
);


--
-- TOC entry 2840 (class 2606 OID 29088)
-- Name: block block_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.block
    ADD CONSTRAINT block_pkey PRIMARY KEY (n);


--
-- TOC entry 2845 (class 2606 OID 29090)
-- Name: gov gov_tx_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gov
    ADD CONSTRAINT gov_tx_key UNIQUE (tx);


--
-- TOC entry 2833 (class 1259 OID 29091)
-- Name: cup_action_act_index; Type: INDEX; Schema: private; Owner: -
--

CREATE INDEX cup_action_act_index ON private.cup_action USING btree (act);


--
-- TOC entry 2834 (class 1259 OID 29092)
-- Name: cup_action_block_index; Type: INDEX; Schema: private; Owner: -
--

CREATE INDEX cup_action_block_index ON private.cup_action USING btree (block);


--
-- TOC entry 2835 (class 1259 OID 29093)
-- Name: cup_action_deleted_index; Type: INDEX; Schema: private; Owner: -
--

CREATE INDEX cup_action_deleted_index ON private.cup_action USING btree (deleted);


--
-- TOC entry 2836 (class 1259 OID 29094)
-- Name: cup_action_id_index; Type: INDEX; Schema: private; Owner: -
--

CREATE INDEX cup_action_id_index ON private.cup_action USING btree (id);


--
-- TOC entry 2837 (class 1259 OID 29095)
-- Name: cup_action_tx_act_arg_idx; Type: INDEX; Schema: private; Owner: -
--
--
CREATE UNIQUE INDEX cup_action_tx_act_arg_idx ON private.cup_action USING btree (tx, act, arg);


--
-- TOC entry 2838 (class 1259 OID 29096)
-- Name: cup_action_tx_index; Type: INDEX; Schema: private; Owner: -
--

CREATE INDEX cup_action_tx_index ON private.cup_action USING btree (tx);


--
-- TOC entry 2841 (class 1259 OID 29097)
-- Name: block_time_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX block_time_index ON public.block USING btree ("time");


--
-- TOC entry 2842 (class 1259 OID 29098)
-- Name: gov_block_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gov_block_index ON public.gov USING btree (block);


--
-- TOC entry 2843 (class 1259 OID 29099)
-- Name: gov_tx_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gov_tx_index ON public.gov USING btree (tx);


--
-- TOC entry 2846 (class 2620 OID 29100)
-- Name: cup_action shut; Type: TRIGGER; Schema: private; Owner: -
--

CREATE TRIGGER shut AFTER INSERT ON private.cup_action FOR EACH ROW WHEN ((new.act = 'shut'::public.act)) EXECUTE PROCEDURE public.exec_set_deleted();


INSERT INTO public.block VALUES (1, to_timestamp(1578770562000/1000), 0.0149222404, 497.4030392532, 1);


CREATE INDEX cup_action_arg_index on private.cup_action(arg);

ALTER TABLE private.cup_action DROP CONSTRAINT tx_act_arg_idx;

ALTER TABLE private.cup_action ADD CONSTRAINT id_tx_act_arg_idx UNIQUE(id, tx, act, arg);


-- Completed on 2020-01-11 14:02:34 AST

--
-- PostgreSQL database dump complete
--

