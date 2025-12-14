"""Tests for LLM formatting prompt combination logic."""

from processors.llm import (
    ADVANCED_PROMPT_DEFAULT,
    DICTIONARY_PROMPT_DEFAULT,
    MAIN_PROMPT_DEFAULT,
    combine_prompt_sections,
)


class TestCombinePromptSections:
    """Tests for combine_prompt_sections() function."""

    def test_main_only_returns_main_default(self) -> None:
        """When only main (always on) with no custom prompt, returns main default."""
        result = combine_prompt_sections(
            main_custom=None,
            advanced_enabled=False,
            advanced_custom=None,
            dictionary_enabled=False,
            dictionary_custom=None,
        )
        assert result == MAIN_PROMPT_DEFAULT

    def test_main_with_custom_prompt(self) -> None:
        """When main has custom prompt, uses custom prompt."""
        custom = "My custom main prompt"
        result = combine_prompt_sections(
            main_custom=custom,
            advanced_enabled=False,
            advanced_custom=None,
            dictionary_enabled=False,
            dictionary_custom=None,
        )
        assert result == custom
        assert MAIN_PROMPT_DEFAULT not in result

    def test_advanced_enabled_uses_default(self) -> None:
        """When advanced enabled with no custom prompt, uses default."""
        result = combine_prompt_sections(
            main_custom=None,
            advanced_enabled=True,
            advanced_custom=None,
            dictionary_enabled=False,
            dictionary_custom=None,
        )
        assert MAIN_PROMPT_DEFAULT in result
        assert ADVANCED_PROMPT_DEFAULT in result

    def test_dictionary_enabled_uses_default(self) -> None:
        """When dictionary enabled with no custom prompt, uses default."""
        result = combine_prompt_sections(
            main_custom=None,
            advanced_enabled=False,
            advanced_custom=None,
            dictionary_enabled=True,
            dictionary_custom=None,
        )
        assert MAIN_PROMPT_DEFAULT in result
        assert DICTIONARY_PROMPT_DEFAULT in result

    def test_multiple_sections_joined_with_double_newline(self) -> None:
        """Multiple enabled sections are joined with double newlines."""
        result = combine_prompt_sections(
            main_custom="Main",
            advanced_enabled=True,
            advanced_custom="Advanced",
            dictionary_enabled=True,
            dictionary_custom="Dictionary",
        )
        assert result == "Main\n\nAdvanced\n\nDictionary"

    def test_order_is_main_advanced_dictionary(self) -> None:
        """Sections appear in order: main, advanced, dictionary."""
        result = combine_prompt_sections(
            main_custom="AAA",
            advanced_enabled=True,
            advanced_custom="BBB",
            dictionary_enabled=True,
            dictionary_custom="CCC",
        )
        parts = result.split("\n\n")
        assert parts == ["AAA", "BBB", "CCC"]

    def test_skipped_sections_do_not_leave_gaps(self) -> None:
        """Disabled sections don't leave extra newlines."""
        result = combine_prompt_sections(
            main_custom="Main",
            advanced_enabled=False,
            advanced_custom=None,
            dictionary_enabled=True,
            dictionary_custom="Dictionary",
        )
        assert result == "Main\n\nDictionary"
        # No triple newlines from skipped section
        assert "\n\n\n" not in result

    def test_empty_string_custom_treated_as_falsy(self) -> None:
        """Empty string custom prompt should use default (empty string is falsy)."""
        result = combine_prompt_sections(
            main_custom="",
            advanced_enabled=False,
            advanced_custom=None,
            dictionary_enabled=False,
            dictionary_custom=None,
        )
        assert result == MAIN_PROMPT_DEFAULT

    def test_default_combination_main_and_advanced(self) -> None:
        """Default app behavior: main + advanced enabled, dictionary disabled."""
        result = combine_prompt_sections(
            main_custom=None,
            advanced_enabled=True,
            advanced_custom=None,
            dictionary_enabled=False,
            dictionary_custom=None,
        )
        assert MAIN_PROMPT_DEFAULT in result
        assert ADVANCED_PROMPT_DEFAULT in result
        assert DICTIONARY_PROMPT_DEFAULT not in result
