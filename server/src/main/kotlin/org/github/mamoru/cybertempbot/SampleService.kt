package org.github.mamoru.cybertempbot

import com.pengrad.telegrambot.model.Message
import mu.KotlinLogging
import org.github.mamoru.cybertempbot.config.CyberTempBotProps
import org.github.mamoru.cybertempbot.dao.SessionContextDao
import org.github.mamoru.cybertempbot.entity.Metric
import org.github.mamoru.cybertempbot.entity.SessionState
import org.github.mamoru.cybertempbot.ext.getContext
import org.github.mamoru.cybertempbot.ext.isAuthenticated
import org.github.mamoru.cybertempbot.telegram.TgSession
import org.github.mamoru.cybertempbot.telegram.annotation.TgCommandHandler
import org.github.mamoru.cybertempbot.telegram.annotation.UnknownTgHandler
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

val LOCAL_ZONE_ID: ZoneId = ZoneId.of("Europe/Kiev")
val LOCAL_DATE_FORMATTER: DateTimeFormatter = DateTimeFormatter.RFC_1123_DATE_TIME.withZone(LOCAL_ZONE_ID)

@Service
class SampleService(
        private val cyberTempBotProps: CyberTempBotProps,
        private val sessionContextDao: SessionContextDao,
        private val metricAnalyzer: MetricAnalyzer
) {
    private val logger = KotlinLogging.logger {}

    @UnknownTgHandler
    fun unknownCommand(session: TgSession, message: Message) {
        val context = session.getContext(sessionContextDao)
        if (context.state != SessionState.AUTH_ASKED) {
            session.sendText("Вот хз че ответить")
            return
        }
        if (message.text() != cyberTempBotProps.botAuthToken) {
            session.sendText("Чет не такой парольчик фрайерок")
            return
        }
        context.state = SessionState.AUTHENTICATED
        sessionContextDao.saveContext(session.sessionId, context)
        session.sendText("Ок понял принял")
    }

    @TgCommandHandler("start")
    fun start(session: TgSession, message: Message) {
        if (!session.isAuthenticated(sessionContextDao)) {
            session.sendText("Вечер в хату")
            showAuthBanner(session)
            return
        }
        session.sendText("Ну шо го дела делать")
    }

    @TgCommandHandler("ask")
    fun askCommand(session: TgSession, message: Message) {
        if (!session.isAuthenticated(sessionContextDao)) {
            session.sendText("Сначала деньги потом стулья. Сначала пароль потом красота.")
            showAuthBanner(session)
            return
        }
        val metric = metricAnalyzer.getLastMetric()
        if (metric == null) {
            session.sendText("Ниче сказать не могу, стукачи не настукали")
            return
        }
        session.sendText(formatMetric(metric))
    }

    private fun showAuthBanner(session: TgSession) {
        val context = session.getContext(sessionContextDao)
        if (context.state != SessionState.AUTH_ASKED) {
            context.state = SessionState.AUTH_ASKED
            sessionContextDao.saveContext(session.sessionId, context)
        }
        session.sendText("Чиркони парольчик плиз")
    }

    private fun formatMetric(metric: Metric): String {
        val time = Instant.ofEpochMilli(metric.timestamp.toLong())
                .atZone(LOCAL_ZONE_ID)
                .format(LOCAL_DATE_FORMATTER)
        return """
Стукачи настукали следующий расклад:
* Температура: ${metric.temp}
* Влажность: ${metric.humidity}
Время стука $time
"""
    }
}
