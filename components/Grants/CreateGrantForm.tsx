import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX, faTimes, faPlus } from "@fortawesome/pro-light-svg-icons";
import { breakpoints } from "~/config/themes/screen";
import { connect } from "react-redux";
import { formGenericStyles } from "../Paper/Upload/styles/formGenericStyles";
import { StyleSheet, css } from "aphrodite";
import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "../Form/Button";
import colors from "../../config/themes/colors";
import dynamic from "next/dynamic";
import FormInput from "../Form/FormInput";
import HubSelectDropdown from "../Hubs/HubSelectDropdown";
import { Post } from "../Document/lib/types";
import { ID } from "~/config/types/root_types";
import { DocumentContext } from "../Document/lib/DocumentContext";
import { parseHub } from "~/config/types/hub";
import { createOrUpdatePostApi } from "../Document/api/createOrUpdatePostApi";
import useCurrentUser from "~/config/hooks/useCurrentUser";
import BountyInput from "../Bounty/BountyInput";
import { createCommentAPI } from "../Comment/lib/api";
import { COMMENT_TYPES } from "../Comment/lib/types";
import { useAlert } from "react-alert";
import { faMinus } from "@fortawesome/pro-regular-svg-icons";
import { createOrUpdateGrantApi } from "./api/createGrant";

const SimpleEditor = dynamic(() => import("../CKEditor/SimpleEditor"));

type FormFields = {
  hubs: any[];
  text: string | TrustedHTML;
  title: string;
};

type FormError = {
  hubs: boolean;
  text: boolean;
  title: boolean;
};

const MIN_TITLE_LENGTH = 10;
const MAX_TITLE_LENGTH = 250;

function validateFormField(fieldID: string, value: any): boolean {
  const result = true;
  switch (fieldID) {
    case "title":
      return (
        value.length >= MIN_TITLE_LENGTH && value.length <= MAX_TITLE_LENGTH
      );
    // case "hubs":
    //   return value && value.length > 0;
    case "text":
      return true;
    default:
      return result;
  }
}

export type CreateGrantFormProps = {
  hubId: string;
  onExit: (event?: SyntheticEvent) => void;
  user: any;
  post?: Post;
};

function CreateGrantForm({ post, user, onExit, hubId }: CreateGrantFormProps) {
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<FormError>({
    hubs: false,
    text: false,
    title: false,
  });
  const [mutableFormFields, setMutableFormFields] = useState<FormFields>({
    hubs: post?.hubs ?? [],
    text: post?.postHtml ?? "",
    title: post?.title ?? "",
  });
  const [shouldDisplayError, setShouldDisplayError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const currentUser = useCurrentUser();
  const documentContext = useContext(DocumentContext);
  const [bountyOffered, setBountyOffered] = useState<number>(0);
  const [bountyError, setBountyError] = useState<any>(null);
  const alert = useAlert();
  const handleBountyInputChange = ({ hasError, errorMsg, value }) => {
    setBountyOffered(value);
    setBountyError(errorMsg);
  };

  const onFormSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (Object.values(formErrors).some((el: boolean): boolean => el)) {
      setShouldDisplayError(true);
      return;
    } else {
      setShouldDisplayError(false);
      setIsSubmitting(true);
    }

    createOrUpdateGrantApi({
      payload: {
        postId: post?.id,
        title: mutableFormFields.title,
        textContent: mutableFormFields.text,
        editorContent: mutableFormFields.text,
        hubIds: [hubId as ID],
        postType: "GRANT",
      },
      currentUser,
      onError: (_err: Error): void => setIsSubmitting(false),
      onSuccess: (response: any): void => {
        const isEditingPost = Boolean(post?.id);
        if (isEditingPost) {
          const updatedHubs = (mutableFormFields.hubs || []).map(parseHub);
          const updated = {
            ...post,
            title: response.title,
            postHtml: response.full_markdown,
            hubs: updatedHubs,
          };
          documentContext.updateDocument(updated);
        } else {
          // Creating new post
          const { id, slug } = response ?? {};
          const questionPath = `/grant/${id}/${slug}`;

          try {
            createCommentAPI({
              content: {
                ops: [
                  {
                    insert: `Offering a bounty to the best answer to this question:\n${mutableFormFields.title}`,
                  },
                  {
                    insert: "\n",
                    attributes: {
                      blockquote: true,
                    },
                  },
                ],
              },
              documentType: "researchhubpost",
              documentId: id,
              bountyAmount: bountyOffered,
              bountyType: COMMENT_TYPES.ANSWER,
            });
          } catch (error) {
            alert.show(
              {
                // @ts-ignore
                text: (
                  <div>
                    {`Your question was created but we couldn't create your bounty at this time.`}
                  </div>
                ),
                buttonText: "OK",
                onClick: () => {},
              },
              { withCancel: false }
            );
          } finally {
          }

          router.push(questionPath);
        }

        onExit();
      },
    });
  };

  const handleOnChangeFields = (fieldID: string, value: string): void => {
    setMutableFormFields({ ...mutableFormFields, [fieldID]: value });
    setFormErrors({
      ...formErrors,
      [fieldID]: !validateFormField(fieldID, value),
    });
    setShouldDisplayError(false);
  };

  return (
    <form
      autoComplete={"off"}
      className={css(styles.askQuestionForm)}
      id="askQuestionForm"
      onSubmit={onFormSubmit}
    >
      <div className={css(formGenericStyles.text, styles.header)}>
        Create a Grant
        <a
          className={css(formGenericStyles.authorGuidelines)}
          style={{ color: colors.BLUE(1) }}
          href="https://www.notion.so/researchhub/Paper-Submission-Guidelines-a2cfa1d9b53c431a91c9816e17f212e1"
          target="_blank"
          rel="noreferrer noopener"
        >
          {"Submission Guidelines"}
        </a>
        <span className={css(styles.close)} onClick={onExit}>
          {<FontAwesomeIcon icon={faX}></FontAwesomeIcon>}
        </span>
      </div>
      <FormInput
        containerStyle={[styles.titleInputContainer]}
        placeholder={"e.g. Are there limits to human knowledge?"}
        error={
          shouldDisplayError && formErrors.title
            ? `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters`
            : null
        }
        errorStyle={styles.errorText}
        id="title"
        value={mutableFormFields.title}
        inputStyle={shouldDisplayError && formErrors.title && styles.error}
        label={"Title"}
        onChange={handleOnChangeFields}
        required
      />
      {/* @ts-ignore */}
      <div className={css(styles.editorWrapper)}>
        <SimpleEditor
          id="text"
          initialData={mutableFormFields.text}
          label="Additional Details"
          placeholder={
            "Include all the information someone would need to answer your question. Be specific about what you need."
          }
          text={mutableFormFields.title}
          onChange={handleOnChangeFields}
          containerStyle={styles.editor}
          required
        />
      </div>
      {!post && (
        <div className={css(styles.researchcoinContainer)}>
          <div className={css(styles.researchcoinTitle)}>
            <div style={{ marginBottom: 10 }}>
              <div className={css(styles.rscLabel)}>
                ResearchCoin Grant<div className={css(styles.asterick)}>*</div>
              </div>
              <p style={{ fontSize: 16, marginBottom: 0 }}>
                Add funding total for the grant.
              </p>
            </div>
          </div>
          <>
            <div
              className={css(
                styles.bountyInputWrapper,
                bountyError && styles.withError
              )}
            >
              <BountyInput handleBountyInputChange={handleBountyInputChange} />
            </div>
            {bountyError && (
              <div className={css(styles.errorText)}>{bountyError}</div>
            )}
          </>
        </div>
      )}
      <div
        className={css(
          styles.buttonsContainer,
          bountyError && styles.buttonRowWithErrorText
        )}
      >
        <Button
          fullWidth
          customButtonStyle={styles.buttonStyle}
          disabled={isSubmitting || bountyError}
          label={post ? "Update" : "Create Grant"}
          type="submit"
        />
      </div>
    </form>
  );
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(CreateGrantForm);

const styles = StyleSheet.create({
  bountyInputWrapper: {
    borderRadius: "4px",
    marginBottom: 20,
    border: `1px solid rgb(232, 232, 242)`,
  },
  withError: {
    border: `1px solid ${colors.RED(1.0)}`,
  },
  addBountyBtn: {
    border: `1px solid ${colors.ORANGE_LIGHT2(1.0)}`,
    color: colors.ORANGE_LIGHT2(1.0),
    background: "white",
  },
  removeBountyBtn: {
    border: `1px solid ${colors.RED(1.0)}`,
    color: colors.RED(1.0),
    background: "white",
  },
  hubsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    color: colors.RED(),
    fontSize: 14,
    textAlign: "left",
    marginTop: -5,
  },
  asterick: {
    color: colors.BLUE(1),
  },
  buttonRowWithErrorText: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  researchcoinContainer: {
    marginBottom: 0,
    marginTop: 30,
  },
  researchcoinTitle: {
    display: "flex",
    marginLeft: "auto",
    width: "100%",
    justifyContent: "space-between",
    [`@media only screen and (max-width: ${breakpoints.mobile.str})`]: {
      display: "block",
      marginBottom: 15,
    },
  },
  rscLabel: {
    cursor: "pointer",
    display: "flex",
    fontWeight: 500,
    marginBottom: 6,
    color: "#232038",
  },
  askQuestionForm: {
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    background: "#FFFFFF",
  },
  close: {
    position: "absolute",
    padding: "16px",
    cursor: "pointer",
    fontSize: 16,
    color: colors.BLACK(0.5),
    top: -32,
    right: -14,
  },
  header: {
    alignItems: "center",
    borderBottom: `1px solid ${colors.GREY_BORDER}`,
    display: "flex",
    fontSize: 26,
    fontWeight: 500,
    justifyContent: "space-between",
    paddingBottom: 8,
    paddingTop: 20,
    position: "relative",
    width: "100%",
    [`@media only screen and (max-width: ${breakpoints.mobile.str})`]: {
      fontSize: 22,
    },
  },
  buttonsContainer: {
    width: 200,
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "30px",
    marginLeft: "auto",
    "@media only screen and (max-width: 767px)": {
      width: "100%",
      justifyContent: "center",
    },
  },
  buttonSpacer: {
    width: "100%",
    maxWidth: "31px",
  },
  chooseHub: {
    width: "100%",
    minHeight: "55px",
    marginBottom: "21px",
  },
  titleInputContainer: {
    width: "auto",
    maxWidth: "851px",
    height: "55px",
    marginBottom: "35px",
  },
  error: {
    border: `1px solid ${colors.RED(1)}`,
  },
  dropDown: {
    zIndex: 999,
  },
  buttonStyle: {
    height: "50px",
  },
  editorWrapper: {
    width: "721px",
    marginBottom: 10,
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      width: "80vw",
    },
    [`@media only screen and (max-width: ${breakpoints.xxsmall.str})`]: {
      width: "100%",
    },
  },
  editor: {
    width: "100%",
  },
  supportText: {
    marginTop: 6,
    opacity: 0.6,
    fontSize: 14,
    letterSpacing: 0.7,
    fontStyle: "italic",
    marginBottom: 6,
  },
});
