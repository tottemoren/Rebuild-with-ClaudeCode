package com.example.demo;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.example.demo.config.JwtConfig;

/**
 * 合言葉（JWT）の鍵の設定のテスト。
 * 鍵が未設定・短すぎるときに、弱い鍵で動き続けず、起動の時点で止まることを確かめる。
 * アプリ全体は起動せず、設定のクラスだけを直接試す。
 */
class JwtConfigTest {

	@Test
	@DisplayName("鍵が未設定（空）のときは、起動の時点でエラーになる")
	void emptySecret_failsToStart() {
		assertThatThrownBy(() -> new JwtConfig(""))
				.isInstanceOf(IllegalStateException.class)
				.hasMessageContaining("JWT_SECRET");
	}

	@Test
	@DisplayName("空白だけの鍵や、32文字より短い鍵のときも、起動の時点でエラーになる")
	void shortSecret_failsToStart() {
		assertThatThrownBy(() -> new JwtConfig("   "))
				.isInstanceOf(IllegalStateException.class);
		assertThatThrownBy(() -> new JwtConfig("a".repeat(31)))
				.isInstanceOf(IllegalStateException.class);
	}

	@Test
	@DisplayName("32文字以上の鍵なら、起動できる")
	void longEnoughSecret_starts() {
		assertThatCode(() -> new JwtConfig("a".repeat(32)))
				.doesNotThrowAnyException();
	}
}
