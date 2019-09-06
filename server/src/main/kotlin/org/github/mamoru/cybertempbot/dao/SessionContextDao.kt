package org.github.mamoru.cybertempbot.dao

import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.github.mamoru.cybertempbot.entity.SessionContext
import org.github.mamoru.cybertempbot.entity.SessionState
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Repository

@Repository
class SessionContextDao(
        private val objectMapper: ObjectMapper,
        private val stringRedisTemplate: StringRedisTemplate) {
    private val logger = KotlinLogging.logger {}

    fun getContext(sessionId: Long): SessionContext = stringRedisTemplate.opsForValue().get("session_${sessionId}")
            ?.let {
                val sessionContext = objectMapper.readValue(it, SessionContext::class.java)
                migrateSession(sessionContext)
                sessionContext
            }
            ?: SessionContext()

    fun saveContext(sessionId: Long, context: SessionContext) {
        stringRedisTemplate.opsForValue().set("session_${sessionId}", objectMapper.writeValueAsString(context))
    }

    private fun migrateSession(sessionContext: SessionContext) {
        if (sessionContext.auth) {
            logger.info("migrating session context")
            sessionContext.state = SessionState.AUTHENTICATED
        }
    }
}
