import assert from "node:assert/strict";
import test from "node:test";
import React from "react";

import { AppShell } from "./app-shell";
import { Sidebar } from "./sidebar";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function countElementsOfType(node: React.ReactNode, target: React.ElementType): number {
  if (!React.isValidElement(node)) {
    return 0;
  }

  const element = node as React.ReactElement<{ children?: React.ReactNode }>;
  const ownCount = element.type === target ? 1 : 0;
  const childCount = React.Children.toArray(element.props.children).reduce<number>(
    (count, child) => count + countElementsOfType(child, target),
    0,
  );

  return ownCount + childCount;
}

test("keeps one Sidebar in the shared application shell", () => {
  const tree = AppShell({ children: <div>Route content</div> });

  assert.equal(countElementsOfType(tree, Sidebar), 1);
});
