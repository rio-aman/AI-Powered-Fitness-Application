package com.fitness.aiservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityAiService {
    private final GeminiService geminiService;

    public Recommendation generateRecommendation(Activity activity) {
        String prompt = createPromptForActivity(activity);
        String aiResponse = geminiService.getRecommendations(prompt);
        log.info("Response from AI {}", aiResponse);
        return processAIResponse(activity, aiResponse);
    }

    private Recommendation processAIResponse(Activity activity, String aiResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(aiResponse);

            JsonNode textNode = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");

            String jsonContent = textNode.asText()
                    .replaceAll("```json\\n", "")
                    .replaceAll("\\n```", "")
                    .trim();

            log.info("PARSED RESPONSE FROM AI: {} ", jsonContent);

            JsonNode analysisJson = mapper.readTree(jsonContent);
            JsonNode analysisNode = analysisJson.path("analysis");

            StringBuilder fullAnalysis = new StringBuilder();
            addAnalysisSection(fullAnalysis, analysisNode, "overall", "Overall:");
            addAnalysisSection(fullAnalysis, analysisNode, "pace", "Pace:");
            addAnalysisSection(fullAnalysis, analysisNode, "heartRate", "Heart Rate:");
            addAnalysisSection(fullAnalysis, analysisNode, "caloriesBurned", "Calories:");

            List<String> improvements = extractImprovements(analysisJson.path("improvements"));
            List<String> suggestions = extractSuggestions(analysisJson.path("suggestions"));
            List<String> safety = extractSafetyGuidelines(analysisJson.path("safety"));

            return Recommendation.builder()
                    .activityId(activity.getId())
                    .userId(activity.getUserId())
                    .activityType(activity.getType())
                    .recommendation(fullAnalysis.toString().trim())
                    .improvements(improvements)
                    .suggestions(suggestions)
                    .safety(safety)
                    .createdAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return createDefaultRecommendation(activity);
        }
    }

    private Recommendation createDefaultRecommendation(Activity activity) {
        return Recommendation.builder()
                .activityId(activity.getId())
                .userId(activity.getUserId())
                .activityType(activity.getType())
                .recommendation("Unable to generate detailed analysis")
                .improvements(Collections.singletonList("Continue with your current routine"))
                .suggestions(Collections.singletonList("Consider consulting a fitness professional"))
                .safety(Arrays.asList(
                        "Always warm up before exercise",
                        "Stay hydrated",
                        "Listen to your body"
                ))
                .createdAt(LocalDateTime.now())
                .build();
    }

    private List<String> extractSafetyGuidelines(JsonNode safetyNode) {
        List<String> safety = new ArrayList<>();
        if (safetyNode.isArray()) {
            safetyNode.forEach(item -> safety.add(item.asText()));
        }
        return safety.isEmpty() ?
                Collections.singletonList("Follow general safety guidelines") :
                safety;
    }

    private List<String> extractSuggestions(JsonNode suggestionsNode) {
        List<String> suggestions = new ArrayList<>();
        if (suggestionsNode.isArray()) {
            suggestionsNode.forEach(suggestion -> {
                String workout = suggestion.path("workout").asText();
                String description = suggestion.path("description").asText();
                suggestions.add(String.format("%s: %s", workout, description));
            });
        }
        return suggestions.isEmpty() ?
                Collections.singletonList("No specific suggestions provided") :
                suggestions;
    }

    private List<String> extractImprovements(JsonNode improvementsNode) {
        List<String> improvements = new ArrayList<>();
        if (improvementsNode.isArray()) {
            improvementsNode.forEach(improvement -> {
                String area = improvement.path("area").asText();
                String detail = improvement.path("recommendation").asText();
                improvements.add(String.format("%s: %s", area, detail));
            });
        }
        return improvements.isEmpty() ?
                Collections.singletonList("No specific improvements provided") :
                improvements;
    }

    private void addAnalysisSection(StringBuilder fullAnalysis, JsonNode analysisNode, String key, String prefix) {
        if (!analysisNode.path(key).isMissingNode()) {
            fullAnalysis.append(prefix)
                    .append(analysisNode.path(key).asText())
                    .append("\n\n");
        }
    }

    private String createPromptForActivity(Activity activity) {
        return String.format("""
                        Analyze the following fitness activity using evidence-based fitness and exercise science principles.
                        Your analysis must be DETAILED, practical, and specific to the given activity data.
                        
                        Use ONLY the provided information. If any metric is missing, make a realistic assumption and clearly state it within the analysis text.
                        
                        Return the response in the EXACT JSON format below.
                        
                        {
                          "analysis": {
                            "overall": "Detailed multi-sentence summary explaining performance quality, effort level, and overall effectiveness of the activity",
                            "pace": "Detailed evaluation of pacing consistency, intensity distribution, and whether the pace is appropriate for the activity type and duration",
                            "heartRate": "Detailed analysis of cardiovascular intensity. If heart rate data is missing, infer intensity based on calories burned and duration and clearly state the assumption",
                            "caloriesBurned": "Detailed explanation of calorie expenditure efficiency, including whether the burn aligns with activity type, duration, and intensity"
                          },
                          "improvements": [
                            {
                              "area": "Clearly defined performance area needing improvement",
                              "recommendation": "Step-by-step, actionable, and measurable improvement strategy with clear reasoning"
                            }
                          ],
                          "suggestions": [
                            {
                              "workout": "Specific workout or training method name",
                              "description": "Detailed explanation of how this workout improves current weaknesses, including intensity, duration, and frequency guidance"
                            }
                          ],
                          "safety": [
                            "Detailed injury-prevention and form-related safety advice relevant to this activity",
                            "Clear hydration, recovery, and rest guidance tailored to the activity intensity",
                            "Consult a qualified doctor or healthcare professional before making significant changes to your fitness routine, especially if you have pre-existing medical conditions, injuries, dizziness, pain, or unusual fatigue"
                          ]
                        }
                        
                        STRICT RULES:
                          - Use simple, clear words that anyone can understand
                          - Output ONLY valid JSON
                          - No markdown
                          - No explanations outside JSON
                          - Every analysis field MUST contain multiple sentences
                          - Recommendations must be practical, realistic, and safe
                          - Safety section MUST always include a doctor or healthcare consultation recommendation, clearly stated in simple words
                          - Do NOT repeat the input values verbatim
                          - Do NOT provide medical diagnoses
                          - Avoid technical jargon; explain concepts in everyday language
                          - Ensure the response is easy to read and follow for all users
                        
                        
                        Activity Details:
                        Activity Type: %s
                        Duration: %d minutes
                        Calories Burned: %d
                        Additional Metrics (JSON or text): %s
                        """,
                activity.getType(),
                activity.getDuration(),
                activity.getCaloriesBurned(),
                activity.getAdditionalMetrics()
        );
    }
}
