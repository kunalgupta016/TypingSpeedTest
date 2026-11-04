# Mobile input notes

FingerFox uses a large transparent textarea over the prompt as the mobile keyboard target. It has autocapitalize, autocorrect, autocomplete, and spellcheck disabled, uses a 16px font to avoid iOS zoom, and derives inserted text by diffing the field value. Composition events are held until composition ends. The visual viewport resize event is observed so mobile browser chrome and the on-screen keyboard can be handled without fixed-height assumptions.

Tap the prompt or the visible “Tap to type” control to focus the input from a user gesture. Desktop keyboard input is normalized by the desktop adapter. Escape pauses and resumes a round. The layout is designed for a 360px wide portrait viewport; real-device checks are still needed across iOS and Android keyboard implementations.
