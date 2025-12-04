import os
import main 

# Verify environment configuration
if not main.active_model:
    print("\n[WARN] Gemini API Key not detected or model failed to initialize.")
    print("       The test will default to fallback logic.\n")

def reset_state():
    """Resets the internal memory state to ensure independent test cases."""
    main.memory["last_insight"] = ""

def run_simulation():
    print("--- Weather Scenario Simulation ---\n")
    
    # Test Data Mock
    scenarios = [
        {
            "name": "🔥 CALOR EXTREMO (Dia)",
            "current": {
                "temperature_2m": 34.5,
                "apparent_temperature": 38.0,
                "relative_humidity_2m": 45,
                "wind_speed_10m": 12,
                "precipitation": 0,
                "is_day": 1,
                "weathercode": 0
            },
            "daily": {"temperature_2m_max": [36], "temperature_2m_min": [22]},
        },
        {
            "name": "⛈️ TEMPESTADE (Noite)",
            "current": {
                "temperature_2m": 21.0,
                "apparent_temperature": 19.0,
                "relative_humidity_2m": 98,
                "wind_speed_10m": 45,
                "precipitation": 12.5,
                "is_day": 0,
                "weathercode": 95
            },
            "daily": {"temperature_2m_max": [24], "temperature_2m_min": [18]},
        },
        {
            "name": "❄️ FRIO INTENSO",
            "current": {
                "temperature_2m": 4.0,
                "apparent_temperature": 1.0,
                "relative_humidity_2m": 60,
                "wind_speed_10m": 20,
                "precipitation": 0,
                "is_day": 0,
                "weathercode": 0
            },
            "daily": {"temperature_2m_max": [12], "temperature_2m_min": [2]},
        },
        {
            "name": "🌤️ DIA AGRADÁVEL (Padrão)",
            "current": {
                "temperature_2m": 23.0,
                "apparent_temperature": 23.0,
                "relative_humidity_2m": 50,
                "wind_speed_10m": 10,
                "precipitation": 0,
                "is_day": 1,
                "weathercode": 0
            },
            "daily": {"temperature_2m_max": [25], "temperature_2m_min": [18]},
        }
    ]

    for s in scenarios:
        print(f"Scenario: {s['name']}")
        print(f"Input Data: {s['current']['temperature_2m']}C | Rain: {s['current']['precipitation']}mm")
        
        # 1. Test Fallback Logic (Deterministic)
        fallback_response = main.generate_fallback_insight(s['current'])
        print(f"Fallback Output: \"{fallback_response}\"")

        # 2. Test Generative Logic
        reset_state()
        
        print("Generative Model Output:")
        try:
            # Generate samples to verify variability
            for i in range(1, 3):
                ai_response = main.generate_ai_insight(s['current'], s['daily'])
                print(f"   Sample {i}: \"{ai_response}\"")
        except Exception as e:
            print(f"   [ERROR] Model execution failed: {e}")
        
        print("-" * 60)

if __name__ == "__main__":
    run_simulation()