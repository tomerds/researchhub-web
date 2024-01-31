import { Fragment, useState } from "react";
import { StyleSheet, css } from "aphrodite";
import isEqual from "lodash/isEqual";

import BaseModal from "../Modals/BaseModal";
import CreateGrantForm from "./CreateGrantForm";
import Button from "../Form/Button";

const EmptyGrantScreen = ({ hub, userId }: { hub: any; userId: string }) => {
  const hubEditorGroup = hub.editor_permission_groups.map((p) => {
    return p.content_type == 2
      ? { hubId: p.object_id, userId: p.user.id }
      : null;
  });

  const [showForm, setShowForm] = useState(false);

  return (
    <Fragment>
      {hubEditorGroup.some((x) =>
        isEqual(x, { hubId: hub.id, userId: userId })
      ) ? (
        <div className={css(styles.column)}>
          <img
            className={css(styles.emptyPlaceholderImage)}
            src={"/static/background/homepage-empty-state.png"}
            loading="lazy"
            alt="Empty State Icon"
          />
          <span className={css(styles.emptyPlaceholderText)}>
            There are no grants yet
          </span>
          <span className={css(styles.emptyPlaceholderSubtitle)}>
            Click 'New Grant' button to create a grant
          </span>
          <Button onClick={() => setShowForm(true)}>New Grant</Button>
        </div>
      ) : (
        <div className={css(styles.column)}>
          <img
            className={css(styles.emptyPlaceholderImage)}
            src={"/static/background/homepage-empty-state.png"}
            loading="lazy"
            alt="Empty State Icon"
          />
          <span className={css(styles.emptyPlaceholderText)}>
            There are no grants yet
          </span>
          <span className={css(styles.emptyPlaceholderSubtitle)}>
            Please come back soon
          </span>
        </div>
      )}
      <div className={css(styles.row)}>
        <BaseModal
          closeOnOverlayClick={false}
          hideClose={true}
          isOpen={showForm}
          children={
            <div>
              <CreateGrantForm
                hubId={hub.id}
                onExit={() => setShowForm(false)}
              />
            </div>
          }
        />
      </div>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  column: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  row: {
    display: "flex",
    justifyContent: "center",
  },
  emptyPlaceholderImage: {
    width: 400,
    objectFit: "contain",
    marginTop: 40,
    "@media only screen and (max-width: 415px)": {
      width: "70%",
    },
  },
  emptyPlaceholderText: {
    textAlign: "center",
    fontSize: 22,
    color: "#241F3A",
    marginTop: 20,
    "@media only screen and (max-width: 767px)": {
      fontSize: 16,
    },
    "@media only screen and (max-width: 415px)": {
      width: "85%",
    },
  },
  emptyPlaceholderSubtitle: {
    textAlign: "center",
    fontSize: 18,
    color: "#4e4c5f",
    marginTop: 10,
    marginBottom: 15,
    "@media only screen and (max-width: 767px)": {
      fontSize: 14,
    },
    "@media only screen and (max-width: 415px)": {
      width: "85%",
    },
  },
  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: 400,
    margin: 0,
    padding: 0,
    lineHeight: 1.3,
    "@media only screen and (max-width: 767px)": {
      fontSize: 22,
    },
    "@media only screen and (max-width: 415px)": {
      fontSize: 18,
    },
  },
});

export default EmptyGrantScreen;
