# Directory rules
- The floating edit toolbar's AI box is a front-end of the AI Builder: it dispatches `unison:builder-send` {prompt, target} and never calls AI itself; why: one agent owns context, button-destination checks and saves.
