import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/services/ai_service.dart';
import '../../../../core/theme/app_colors.dart';

class PlataIaScreen extends ConsumerStatefulWidget {
  const PlataIaScreen({super.key});

  @override
  ConsumerState<PlataIaScreen> createState() => _PlataIaScreenState();
}

class _PlataIaScreenState extends ConsumerState<PlataIaScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, String>> _messages = [
    {
      'sender': 'ai',
      'text': '¡Hola! Soy Nova IA, tu asistente financiero personal.\n\n🚧 Actualmente me encuentro en proceso de desarrollo y entrenamiento. Pronto estaré disponible para ayudarte a organizar tu dinero y presupuesto. ¡Vuelve más tarde!',
    }
  ];
  bool _isLoading = false;

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'sender': 'user', 'text': text});
      _isLoading = true;
    });
    _messageController.clear();
    _scrollToBottom();

    final aiService = ref.read(aiServiceProvider);
    final response = await aiService.sendMessage(text);

    if (mounted) {
      setState(() {
        _messages.add({'sender': 'ai', 'text': response});
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.graphite700, width: 1)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(LucideIcons.sparkles, color: AppColors.accent, size: 20),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Nova IA', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
                    Text('Tu asistente financiero', style: TextStyle(fontSize: 12, color: AppColors.textGray400)),
                  ],
                ),
              ],
            ),
          ),
          
          // Development Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            color: Colors.amber.withOpacity(0.2),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(LucideIcons.construction, color: Colors.amber, size: 16),
                SizedBox(width: 8),
                Text(
                  'Módulo en desarrollo',
                  style: TextStyle(color: Colors.amber, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          
          // Chat Area
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                final isUser = message['sender'] == 'user';
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Row(
                    mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (!isUser) ...[
                        Container(
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(color: AppColors.graphite800, shape: BoxShape.circle),
                          child: const Icon(LucideIcons.bot, color: AppColors.accent, size: 16),
                        ),
                      ],
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: isUser ? AppColors.accent : AppColors.graphite800,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(20),
                              topRight: const Radius.circular(20),
                              bottomLeft: Radius.circular(isUser ? 20 : 4),
                              bottomRight: Radius.circular(isUser ? 4 : 20),
                            ),
                          ),
                          child: Text(
                            message['text'] ?? '',
                            style: TextStyle(
                              color: isUser ? AppColors.graphite900 : Colors.white,
                              fontSize: 15,
                              fontWeight: isUser ? FontWeight.w500 : FontWeight.normal,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          
          // Loading indicator
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Row(
                children: [
                  SizedBox(width: 48), // Padding equivalent to avatar
                  Text('Nova IA está pensando...', style: TextStyle(color: AppColors.textGray500, fontSize: 12, fontStyle: FontStyle.italic)),
                ],
              ),
            ),

          // Input Area
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.graphite900,
              border: Border(top: BorderSide(color: AppColors.graphite700, width: 1)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    enabled: false,
                    style: const TextStyle(color: Colors.white70),
                    decoration: InputDecoration(
                      hintText: 'Chatbot en mantenimiento...',
                      hintStyle: const TextStyle(color: AppColors.textGray500),
                      filled: true,
                      fillColor: AppColors.graphite800.withOpacity(0.5),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: null,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.graphite700,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      LucideIcons.send,
                      color: AppColors.textGray500,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
