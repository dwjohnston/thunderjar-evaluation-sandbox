import { declarePromptSet } from "thunderjar";

// Nothing added: the agent gets the repo's own AGENTS.md. Thunderjar requires a prompt set on
// every test case, so this is the "no extra prompts" one.
export default declarePromptSet({});
