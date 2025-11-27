package com.example.demo.controller;

import com.example.demo.service.PokemonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pokemon")
@CrossOrigin(origins = "*")
public class PokemonController {

    @Autowired
    private PokemonService pokemonService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPokemonList(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "false") boolean includeAlternativeForms) {
        return ResponseEntity.ok(pokemonService.getPokemonList(limit, offset, includeAlternativeForms));
    }

    @GetMapping("/types")
    public ResponseEntity<List<Map<String, String>>> getPokemonTypes() {
        return ResponseEntity.ok(pokemonService.getPokemonTypes());
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchPokemon(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "false") boolean includeAlternativeForms) {
        return ResponseEntity.ok(pokemonService.searchPokemon(name, type, limit, offset, includeAlternativeForms));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPokemonById(@PathVariable int id) {
        return ResponseEntity.ok(pokemonService.getPokemonById(id));
    }
}