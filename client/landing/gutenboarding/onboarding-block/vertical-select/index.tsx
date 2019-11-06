
/**
 * External dependencies
 */
import React, { useState, useCallback, useRef } from 'react';
import { __ as NO__ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Suggestions from '../../../../components/suggestions';
import { STORE_KEY } from '../../store';

/**
 * Style dependencies
 */
import './style.scss';
import { SiteVertical, isFilledFormValue } from '../../store/types';

interface Props {
	inputClass: string;
}

export default function VerticalSelect( { inputClass }: Props ) {
	const popular = [
		NO__( 'Travel Agency' ),
		NO__( 'Digital Marketing' ),
		NO__( 'Cameras & Photography' ),
		NO__( 'Website Designer' ),
		NO__( 'Restaurants' ),
		NO__( 'Fashion Designer' ),
		NO__( 'Real Estate Agent' ),
	];

	const [ inputValue, setInputValue ] = useState( '' );
	const [ suggestionsVisibility, setsuggestionsVisibility ] = useState( false );

	const suggestionRef = useRef< Suggestions >( null );
	const inputRef = useRef< HTMLInputElement >( null );

	const verticals = useSelect( select =>
		select( STORE_KEY )
			.getVerticals()
			.map( x => ( {
				label: x.vertical_name,
				id: x.vertical_id,
			} ) )
	);

	const { siteVertical } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteVertical } = useDispatch( STORE_KEY );

	const showSuggestions = () => setsuggestionsVisibility( true );
	const hideSuggestions = () => setsuggestionsVisibility( false );

	const handleSuggestionChangeEvent = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => setInputValue( e.target.value as string ),
		[ setInputValue ]
	);

	const handleSuggestionKeyDown = useCallback(
		( e: React.KeyboardEvent< HTMLInputElement > ) => {
			if ( suggestionRef && suggestionRef.current ) {
				if ( suggestionRef.current.props.suggestions.length > 0 && e.key === 'Enter' ) {
					e.preventDefault();
				}

				suggestionRef.current.handleKeyEvent( e );
			}
		},
		[ setInputValue ]
	);

	const handleSelect = ( vertical: SiteVertical ) => {
		setSiteVertical( vertical );
		hideSuggestions();
		if ( inputRef && inputRef.current ) {
			inputRef.current.blur();
		}
	};

	const getInputValue = () =>
		suggestionsVisibility || ! isFilledFormValue( siteVertical ) ? inputValue : siteVertical.label;

	const getSuggestions = () => {
		if ( ! verticals.length ) {
			return [
				{
					label: '',
					category: NO__( 'Loading, please wait...' ),
				},
			];
		}
		if ( ! inputValue.length ) {
			return popular.map( label => ( {
				...verticals.find( vertical => vertical.label.includes( label ) ),
				category: NO__( 'Popular' ),
			} ) );
		}

		return verticals.filter( x => x.label.toLowerCase().includes( inputValue.toLowerCase() ) );
	};

	return (
		<div className="vertical-select">
			<input
				ref={ inputRef }
				className={ inputClass }
				placeholder={ NO__( 'enter a topic' ) }
				onChange={ handleSuggestionChangeEvent }
				onFocus={ showSuggestions }
				onBlur={ hideSuggestions }
				onKeyDown={ handleSuggestionKeyDown }
				autoComplete="off"
				value={ getInputValue() }
			/>
			{ suggestionsVisibility && (
				<Suggestions
					ref={ suggestionRef }
					query={ inputValue }
					suggestions={ getSuggestions() }
					suggest={ handleSelect }
				/>
			) }
		</div>
	);
}