import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../transactions/providers/transactions_provider.dart';

class AnalysisScreen extends ConsumerWidget {
  const AnalysisScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final transactions = ref.watch(transactionsProvider);
    
    double totalIncome = 0;
    double totalExpense = 0;
    
    for (var tx in transactions) {
      if (tx.amount > 0) {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount.abs();
      }
    }

    final hasData = totalIncome > 0 || totalExpense > 0;
    final balance = totalIncome - totalExpense;

    return Scaffold(
      backgroundColor: AppColors.graphite900,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Text('Análisis Financiero', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: !hasData 
          ? const Center(child: Text('No hay datos suficientes para analizar.', style: TextStyle(color: AppColors.textGray400)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Balance Summary
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.graphite800,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.graphite700),
                    ),
                    child: Column(
                      children: [
                        const Text('Balance Neto', style: TextStyle(color: AppColors.textGray400, fontSize: 14)),
                        const SizedBox(height: 8),
                        Text(
                          '\$${balance.abs().toStringAsFixed(0)}',
                          style: TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            color: balance >= 0 ? AppColors.accent : AppColors.danger,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            Column(
                              children: [
                                const Row(
                                  children: [
                                    Icon(LucideIcons.arrowDownLeft, color: AppColors.accent, size: 16),
                                    SizedBox(width: 4),
                                    Text('Ingresos', style: TextStyle(color: AppColors.textGray400, fontSize: 12)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text('\$${totalIncome.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                              ],
                            ),
                            Container(width: 1, height: 40, color: AppColors.graphite700),
                            Column(
                              children: [
                                Row(
                                  children: [
                                    Icon(LucideIcons.arrowUpRight, color: AppColors.danger.withValues(alpha: 0.8), size: 16),
                                    const SizedBox(width: 4),
                                    const Text('Gastos', style: TextStyle(color: AppColors.textGray400, fontSize: 12)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text('\$${totalExpense.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                              ],
                            ),
                          ],
                        )
                      ],
                    ),
                  ).animate().fade().slideY(begin: 0.1),

                  const SizedBox(height: 32),
                  const Text('Distribución de Gastos', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),

                  // Simple Progress Bars for top categories
                  _buildCategoryBar('Comida y Domicilios', 0.45, AppColors.accent, '\$${(totalExpense * 0.45).toStringAsFixed(0)}').animate().fade(delay: 100.ms).slideX(),
                  const SizedBox(height: 16),
                  _buildCategoryBar('Transporte', 0.25, Colors.blue, '\$${(totalExpense * 0.25).toStringAsFixed(0)}').animate().fade(delay: 200.ms).slideX(),
                  const SizedBox(height: 16),
                  _buildCategoryBar('Ocio y Diversión', 0.20, Colors.purple, '\$${(totalExpense * 0.20).toStringAsFixed(0)}').animate().fade(delay: 300.ms).slideX(),
                  const SizedBox(height: 16),
                  _buildCategoryBar('Otros', 0.10, Colors.orange, '\$${(totalExpense * 0.10).toStringAsFixed(0)}').animate().fade(delay: 400.ms).slideX(),

                  const SizedBox(height: 48),
                  
                  // AI Insight
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.accent.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: const BoxDecoration(
                            color: AppColors.accent,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(LucideIcons.bot, color: AppColors.graphite900, size: 20),
                        ),
                        const SizedBox(width: 16),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Insight de Nova IA', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold, fontSize: 14)),
                              SizedBox(height: 8),
                              Text(
                                'Estás gastando el 45% de tus ingresos en Comida. Si reduces tus domicilios a 2 veces por semana, podrías ahorrar un estimado de \$150.000 COP a final de mes.',
                                style: TextStyle(color: AppColors.textGray200, fontSize: 13, height: 1.5),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ).animate().fade(delay: 600.ms).scale(),
                ],
              ),
            ),
    );
  }

  Widget _buildCategoryBar(String name, double percentage, Color color, String amount) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(name, style: const TextStyle(color: Colors.white, fontSize: 14)),
            Text(amount, style: const TextStyle(color: AppColors.textGray400, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 8),
        Stack(
          children: [
            Container(
              height: 8,
              decoration: BoxDecoration(
                color: AppColors.graphite800,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            FractionallySizedBox(
              widthFactor: percentage,
              child: Container(
                height: 8,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
