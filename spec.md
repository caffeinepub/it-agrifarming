# Specification

## Summary
**Goal:** Add an emotional state to the plant health assessment results, showing one of five emotions (angry, sad, happy, worried, upset) with a matching emoji and child-friendly message.

**Planned changes:**
- Add an `emotion` field to the `Plant` record in the backend `assessPlant` function, using deterministic logic to vary the emotion across different inputs
- Update the frontend `useAssessPlant` hook and Plant type to include and expose the `emotion` field
- Update the `PlantResults` component to display the plant's emotion prominently at the top of results, with a large animated emoji (😠😢😊😟😤), a bold emotion label, and a short child-friendly message — above the existing five need-detection cards

**User-visible outcome:** After scanning a plant, users see their plant's emotional state displayed at the top of the results with a big emoji, a bold label like "Your plant is HAPPY! 😊", and a friendly message, followed by the existing five need-detection cards.
