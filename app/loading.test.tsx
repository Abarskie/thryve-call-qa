import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import Loading from "./loading";

test("renders an accessible route-loading status", () => {
  const markup = renderToStaticMarkup(<Loading />);

  assert.match(markup, /role="status"/);
  assert.match(markup, />Loading Callsy QA</);
});
