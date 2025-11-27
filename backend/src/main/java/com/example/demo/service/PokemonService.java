package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@Service
public class PokemonService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

    public Map<String, Object> getPokemonList(int limit, int offset, boolean includeAlternativeForms) {
        try {
            String url = POKEAPI_BASE_URL + "/pokemon?limit=" + limit + "&offset=" + offset;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            List<Map<String, String>> results = new ArrayList<>();
            for (JsonNode node : root.get("results")) {
                String name = node.get("name").asText();
                String pokemonUrl = node.get("url").asText();

                // Parse ID from URL
                String[] urlParts = pokemonUrl.split("/");
                int id = Integer.parseInt(urlParts[urlParts.length - 1]);

                // Skip alternative forms if not requested
                if (!includeAlternativeForms && id > 10000) {
                    continue;
                }

                Map<String, String> pokemon = new HashMap<>();
                pokemon.put("name", name);
                pokemon.put("url", pokemonUrl);
                results.add(pokemon);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("results", results);
            result.put("count", includeAlternativeForms ? 1302 : 1010);
            return result;

        } catch (Exception e) {
            throw new RuntimeException("Error fetching Pokemon list", e);
        }
    }

    public List<Map<String, String>> getPokemonTypes() {
        try {
            String url = POKEAPI_BASE_URL + "/type";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            List<Map<String, String>> types = new ArrayList<>();
            for (JsonNode node : root.get("results")) {
                String name = node.get("name").asText();
                String typeUrl = node.get("url").asText();

                // Skip unknown and stellar types
                if (!Arrays.asList("unknown", "stellar").contains(name)) {
                    Map<String, String> type = new HashMap<>();
                    type.put("name", name);
                    type.put("url", typeUrl);
                    types.add(type);
                }
            }

            return types;

        } catch (Exception e) {
            throw new RuntimeException("Error fetching Pokemon types", e);
        }
    }

    public Map<String, Object> searchPokemon(String name, String type, int limit, int offset, boolean includeAlternativeForms) {
        try {
            List<Map<String, String>> results = new ArrayList<>();

            if (name != null && !name.trim().isEmpty()) {
                // Search by name
                try {
                    String searchUrl = POKEAPI_BASE_URL + "/pokemon/" + name.toLowerCase();
                    ResponseEntity<String> response = restTemplate.getForEntity(searchUrl, String.class);
                    JsonNode pokemon = objectMapper.readTree(response.getBody());

                    int id = pokemon.get("id").asInt();
                    if (includeAlternativeForms || id <= 10000) {
                        Map<String, String> result = new HashMap<>();
                        result.put("name", pokemon.get("name").asText());
                        result.put("url", POKEAPI_BASE_URL + "/pokemon/" + id + "/");
                        results.add(result);
                    }
                } catch (Exception e) {
                    // Pokemon not found, return empty results
                }

            } else if (type != null && !type.trim().isEmpty()) {
                // Search by type
                String typeUrl = POKEAPI_BASE_URL + "/type/" + type.toLowerCase();
                ResponseEntity<String> response = restTemplate.getForEntity(typeUrl, String.class);
                JsonNode root = objectMapper.readTree(response.getBody());

                List<Map<String, String>> typeResults = new ArrayList<>();
                for (JsonNode pokemon : root.get("pokemon")) {
                    JsonNode pokemonData = pokemon.get("pokemon");
                    String pokemonUrl = pokemonData.get("url").asText();

                    // Parse ID from URL
                    String[] urlParts = pokemonUrl.split("/");
                    int id = Integer.parseInt(urlParts[urlParts.length - 1]);

                    // Skip alternative forms if not requested
                    if (!includeAlternativeForms && id > 10000) {
                        continue;
                    }

                    Map<String, String> result = new HashMap<>();
                    result.put("name", pokemonData.get("name").asText());
                    result.put("url", pokemonUrl);
                    typeResults.add(result);
                }

                // Apply pagination
                int startIndex = offset;
                int endIndex = Math.min(startIndex + limit, typeResults.size());
                if (startIndex < typeResults.size()) {
                    results = typeResults.subList(startIndex, endIndex);
                }

                Map<String, Object> result = new HashMap<>();
                result.put("results", results);
                result.put("count", typeResults.size());
                return result;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("results", results);
            result.put("count", results.size());
            return result;

        } catch (Exception e) {
            throw new RuntimeException("Error searching Pokemon", e);
        }
    }

    public Map<String, Object> getPokemonById(int id) {
        try {
            String url = POKEAPI_BASE_URL + "/pokemon/" + id;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            Map<String, Object> pokemon = new HashMap<>();
            pokemon.put("id", root.get("id").asInt());
            pokemon.put("name", root.get("name").asText());
            pokemon.put("height", root.get("height").asInt());
            pokemon.put("weight", root.get("weight").asInt());
            pokemon.put("base_experience", root.get("base_experience").asInt());

            // Parse types
            List<Map<String, String>> types = new ArrayList<>();
            for (JsonNode typeNode : root.get("types")) {
                Map<String, String> typeMap = new HashMap<>();
                typeMap.put("name", typeNode.get("type").get("name").asText());
                types.add(typeMap);
            }
            pokemon.put("types", types);

            // Parse sprites
            Map<String, Object> sprites = new HashMap<>();
            if (root.has("sprites")) {
                JsonNode spritesNode = root.get("sprites");
                if (spritesNode.has("front_default")) {
                    sprites.put("front_default", spritesNode.get("front_default").asText());
                }
                if (spritesNode.has("other") && spritesNode.get("other").has("official-artwork")) {
                    JsonNode artwork = spritesNode.get("other").get("official-artwork");
                    if (artwork.has("front_default")) {
                        Map<String, String> other = new HashMap<>();
                        other.put("front_default", artwork.get("front_default").asText());
                        sprites.put("other", Map.of("official-artwork", other));
                    }
                }
            }
            pokemon.put("sprites", sprites);

            // Parse stats
            List<Map<String, Object>> stats = new ArrayList<>();
            for (JsonNode statNode : root.get("stats")) {
                Map<String, Object> statMap = new HashMap<>();
                statMap.put("base_stat", statNode.get("base_stat").asInt());
                statMap.put("name", statNode.get("stat").get("name").asText());
                stats.add(statMap);
            }
            pokemon.put("stats", stats);

            return pokemon;

        } catch (Exception e) {
            throw new RuntimeException("Error fetching Pokemon by ID", e);
        }
    }
}