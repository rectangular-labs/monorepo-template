#!/usr/bin/env node

import { runTemplateCLI } from "bingo";

import template from "../src/template.ts";

// @ts-expect-error
process.exitCode = await runTemplateCLI(template);
