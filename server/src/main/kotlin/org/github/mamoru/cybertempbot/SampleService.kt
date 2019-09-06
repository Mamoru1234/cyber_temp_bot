package org.github.mamoru.cybertempbot

import com.pengrad.telegrambot.model.Message
import mu.KotlinLogging
import org.github.mamoru.cybertempbot.dao.SessionContextDao
import org.github.mamoru.cybertempbot.entity.Metric
import org.github.mamoru.cybertempbot.entity.SessionContext
import org.github.mamoru.cybertempbot.entity.SessionState
import org.github.mamoru.cybertempbot.telegram.TgSession
import org.github.mamoru.cybertempbot.telegram.annotation.TgCommandHandler
import org.github.mamoru.cybertempbot.telegram.annotation.UnknownTgHandler
import org.springframework.stereotype.Service

val AUTHENTICATED_STATES = arrayOf(SessionState.AUTHENTICATED)

@Service
class SampleService(
        private val sessionContextDao: SessionContextDao,
        private val metricAnalyzer: MetricAnalyzer
) {
    private val logger = KotlinLogging.logger {}

    @UnknownTgHandler
    fun unknownCommand(session: TgSession, message: Message) {
        val context = sessionContextDao.getContext(session.sessionId)
        if (context.state != SessionState.AUTH_ASKED) {
            session.sendText("Вот хз че ответить")
            return
        }
        context.state = SessionState.AUTHENTICATED
        sessionContextDao.saveContext(session.sessionId, context)
        session.sendText("Ок понял принял")
    }

    @TgCommandHandler("start")
    fun start(session: TgSession, message: Message) {
        val context = sessionContextDao.getContext(session.sessionId)
        if (!isAuthenticated(context)) {
            session.sendText("Вечер в хату")
            showAuthBanner(context, session)
            return
        }
        session.sendText("Ну шо го дела делать")
    }

    @TgCommandHandler("ask")
    fun askCommand(session: TgSession, message: Message) {
        val context = sessionContextDao.getContext(session.sessionId)
        if (!isAuthenticated(context)) {
            session.sendText("Сначала деньги потом стулья. Сначала пароль потом красота.")
            showAuthBanner(context, session)
            return
        }
        val metric = metricAnalyzer.getLastMetric()
        if (metric == null) {
            session.sendText("Ниче сказать не могу, стукачи не настукали")
            return
        }
        session.sendText(formatMetric(metric))
    }

    private fun showAuthBanner(context: SessionContext, session: TgSession) {
        if (context.state != SessionState.AUTH_ASKED) {
            context.state = SessionState.AUTH_ASKED
            sessionContextDao.saveContext(session.sessionId, context)
        }
        session.sendText("Чиркони парольчик плиз")
    }

    private fun formatMetric(metric: Metric): String {
        return """
Стукачи настукали следующий расклад:
* Температура: ${metric.temp}
* Влажность: ${metric.humidity}
"""
    }

    private fun isAuthenticated(sessionContext: SessionContext): Boolean = AUTHENTICATED_STATES
            .contains(sessionContext.state)
}
