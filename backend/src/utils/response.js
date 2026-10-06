'use strict';

function ok(res, data, meta, status = 200) {
  const body = { data };
  if (meta !== undefined) body.meta = meta;
  return res.status(status).json(body);
}

function created(res, data, meta) {
  return ok(res, data, meta, 201);
}

function fail(res, status, code, message, details) {
  const error = { code, message };
  if (details !== undefined) error.details = details;
  return res.status(status).json({ error });
}

module.exports = { ok, created, fail };
