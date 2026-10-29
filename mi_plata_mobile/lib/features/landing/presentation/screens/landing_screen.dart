import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/theme/app_colors.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.graphite900,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // HEADER
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.asset(
                            'assets/images/logo.png',
                            width: 32,
                            height: 32,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: AppColors.accent.withValues(alpha: 0.2),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(LucideIcons.wallet, color: AppColors.accent, size: 20),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text('Nova Plata', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    Row(
                      children: [
                        TextButton(
                          onPressed: () => context.push('/login'),
                          child: const Text('Ingresar', style: TextStyle(color: AppColors.textGray400, fontSize: 14)),
                        ),
                        ElevatedButton(
                          onPressed: () => context.push('/register'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accent,
                            foregroundColor: AppColors.graphite900,
                            minimumSize: const Size(0, 36),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          child: const Text('Crear cuenta', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    )
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // HERO SECTION
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.accent.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(LucideIcons.sparkles, color: AppColors.accent, size: 14),
                          const SizedBox(width: 6),
                          Text('El futuro de tus finanzas personales', style: TextStyle(color: AppColors.accent.withValues(alpha: 0.9), fontSize: 12, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Controla tu dinero.\nEntiende tus hábitos.\nConstruye tus metas.',
                      style: TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Colors.white, height: 1.1, letterSpacing: -1),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Nova Plata es la plataforma financiera definitiva para gestionar tu presupuesto, rastrear gastos y planificar tu futuro con el poder de la Inteligencia Artificial.',
                      style: TextStyle(fontSize: 14, color: AppColors.textGray400, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: () => context.push('/register'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accent,
                        foregroundColor: AppColors.graphite900,
                        minimumSize: const Size(double.infinity, 56),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Comenzar ahora', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          SizedBox(width: 8),
                          Icon(LucideIcons.arrowRight, size: 20),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => context.push('/login'),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.graphite700),
                        minimumSize: const Size(double.infinity, 56),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        backgroundColor: AppColors.graphite800,
                      ),
                      child: const Text('Iniciar sesión', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 48),

              const SizedBox(height: 16),
              
              // FEATURES
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Todo lo que necesitas en un solo lugar',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Herramientas profesionales diseñadas para potenciar tu salud financiera.',
                      style: TextStyle(fontSize: 14, color: AppColors.textGray400),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),

                    // Feature 0 (What is Nova Plata?)
                    _buildFeatureCard(
                      icon: LucideIcons.wallet,
                      iconColor: AppColors.accent,
                      title: '¿Qué es Nova Plata?',
                      description: 'Es una aplicación móvil de gestión de finanzas personales que te permite llevar un control estricto de tus ingresos y gastos, establecer metas y visualizar reportes interactivos.',
                    ).animate().fade(duration: 400.ms).slideY(begin: 0.1),

                    // Feature 1
                    _buildFeatureCard(
                      icon: LucideIcons.pieChart,
                      iconColor: AppColors.accent,
                      title: 'Control de Presupuestos',
                      badge: 'EN VIVO',
                      badgeColor: AppColors.accent,
                      description: 'Establece límites mensuales por categoría y recibe alertas cuando estés cerca de excederlos.',
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Alimentación & Café', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              Text('\$480.000 / \$600.000', style: TextStyle(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          LinearProgressIndicator(
                            value: 0.8,
                            backgroundColor: AppColors.graphite900,
                            color: AppColors.accent,
                            borderRadius: BorderRadius.circular(4),
                            minHeight: 6,
                          ),
                        ],
                      ),
                    ),

                    // Feature 2
                    _buildFeatureCard(
                      icon: LucideIcons.target,
                      iconColor: Colors.blue,
                      title: 'Metas de Ahorro',
                      badge: '78% logrado',
                      badgeColor: Colors.blue,
                      description: 'Define objetivos claros, separa el dinero virtualmente y observa cómo crece tu progreso mes a mes.',
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Fondo de Emergencia', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                          Text('\$2.500.000 COP', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),

                    // Feature 3
                    _buildFeatureCard(
                      icon: LucideIcons.barChart3,
                      iconColor: AppColors.accentDark,
                      title: 'Análisis Profundo',
                      description: 'Visualiza tus hábitos con gráficos detallados, identifica gastos hormiga y proyecta tu futuro financiero.',
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.graphite900,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.graphite600),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.bot, color: AppColors.accent, size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: RichText(
                                text: const TextSpan(
                                  style: TextStyle(color: AppColors.textGray200, fontSize: 11),
                                  children: [
                                    TextSpan(text: 'Nova IA: ', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold)),
                                    TextSpan(text: 'Detectamos \$42.000 de suscripciones inactivas este mes.'),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Feature 4
                    _buildFeatureCard(
                      icon: LucideIcons.shieldCheck,
                      iconColor: Colors.white,
                      title: 'Seguridad de Grado Bancario',
                      description: 'Tus credenciales están encriptadas con cifrado AES-256 de extremo a extremo.',
                    ).animate().fade(duration: 400.ms, delay: 400.ms).slideY(begin: 0.1),
                  ],
                ),
              ),

              const SizedBox(height: 64),
              
              // FOOTER
              Container(
                color: AppColors.graphite900,
                padding: const EdgeInsets.all(32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: Image.asset(
                            'assets/images/logo.png',
                            width: 24,
                            height: 24,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: AppColors.accent,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(LucideIcons.wallet, color: AppColors.graphite900, size: 16),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text('Nova Plata', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'La plataforma financiera inteligente que te ayuda a tomar el control de tu futuro, hoy.',
                      style: TextStyle(color: AppColors.textGray500, fontSize: 12),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    const Text(
                      '© 2026 Nova Plata. Todos los derechos reservados.\nVersión 1.0.1',
                      style: TextStyle(color: AppColors.textGray500, fontSize: 11, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildFeatureCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    String? badge,
    Color? badgeColor,
    required String description,
    Widget? child,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.graphite800,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.graphite700),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Text(
                            title,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (badge != null && badgeColor != null)
                          Container(
                            margin: const EdgeInsets.only(left: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: badgeColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(badge, style: TextStyle(color: badgeColor, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(description, style: const TextStyle(color: AppColors.textGray400, fontSize: 12, height: 1.4)),
                  ],
                ),
              ),
            ],
          ),
          if (child != null) ...[
            const SizedBox(height: 20),
            child,
          ]
        ],
      ),
    );
  }
}
