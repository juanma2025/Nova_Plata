import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/env.dart';

final aiServiceProvider = Provider<AiService>((ref) {
  return AiService();
});

class AiService {
  final String _model = 'gemini-1.5-flash';
  final List<Map<String, dynamic>> _history = [];

  AiService() {
    // Contexto inicial del asistente usando historial
    _history.add({
      "role": "user",
      "parts": [{"text": "Instrucciones críticas: A partir de ahora eres Nova IA, el asistente financiero experto, amigable y conciso integrado en la app 'Nova Plata'. Tu objetivo es ayudar al usuario a entender sus finanzas, darle consejos de ahorro y responder sus dudas sobre dinero. Responde siempre en español, con un tono profesional pero cercano, estilo Apple. Usa emojis de forma sutil. Mantén tus respuestas breves, estructuradas y fáciles de leer en un dispositivo móvil. Usa viñetas simples en lugar de markdown complejo. Confirma entendimiento."}]
    });
    _history.add({
      "role": "model",
      "parts": [{"text": "¡Entendido! Soy Nova IA y estoy preparado para asistir a los usuarios de Nova Plata con sus finanzas."}]
    });
  }

  Future<String> sendMessage(String message) async {
    if (Env.geminiApiKey == 'INGRESAR_AQUI_TU_API_KEY' || Env.geminiApiKey.isEmpty) {
      return '⚠️ Error: No se ha configurado la API Key de Gemini.';
    }

    // Agregar mensaje del usuario
    _history.add({
      "role": "user",
      "parts": [{"text": message}]
    });

    final url = Uri.parse('https://generativelanguage.googleapis.com/v1beta/models/$_model:generateContent?key=${Env.geminiApiKey}');
    
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          "contents": _history,
          "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800,
          }
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['candidates'] != null && data['candidates'].isNotEmpty) {
          final replyText = data['candidates'][0]['content']['parts'][0]['text'] as String;
          
          // Guardar respuesta de la IA
          _history.add({
            "role": "model",
            "parts": [{"text": replyText}]
          });
          
          return replyText;
        } else {
          _history.removeLast();
          return 'Recibí una respuesta vacía. Por favor, intenta de nuevo.';
        }
      } else {
        // Falló HTTP
        _history.removeLast(); // Remover mensaje para poder reintentar
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['error']?['message'] ?? 'Error desconocido';
        print('GEMINI API ERROR (${response.statusCode}): $errorMessage');
        
        return 'Lo siento, hubo un problema con la IA (Código ${response.statusCode}). Detalle: $errorMessage';
      }
    } catch (e) {
      _history.removeLast();
      print('GEMINI NETWORK ERROR: $e');
      return 'Problema de conexión o red. Revisa tu internet e iquita ntenta de nuevo.';
    }
  }
}
